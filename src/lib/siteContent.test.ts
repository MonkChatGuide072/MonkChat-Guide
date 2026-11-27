import { describe, expect, it, vi } from 'vitest'
import { applyActivityCopy, pageFields, validPageCopy, resolveSiteImages } from './siteContent'
import { getActivitiesPageContent } from '../content/activitiesContent'
const storage=vi.hoisted(()=>({sign:vi.fn()}))
vi.mock('./supabase',()=>({supabaseClient:{storage:{from:()=>({createSignedUrls:storage.sign})}}}))

describe('editable website content',()=>{
 it('accepts editable statistics, local uploaded image references and activity visibility',()=>{
  expect(validPageCopy('home',{home_stat_sessions:'123',image_url:'/site-images/00000000-0000-4000-8000-000000000001/00000000-0000-4000-8000-000000000002.jpg'})).toBe(true)
  expect(validPageCopy('activities',{activity_card_visible_0:'false',activity_card_order_0:'2',activity_gallery_cards_0_badge:'ข้อความที่แก้จริง'})).toBe(true)
 })
 it('rejects non-finite or negative statistics and unknown fields',()=>{
  for(const value of ['-1','Infinity','1e10','<script>','10000000000'])expect(validPageCopy('home',{home_stat_sessions:value})).toBe(false)
  expect(validPageCopy('activities',{home_stat_sessions:'1'})).toBe(false)
  expect(validPageCopy('home',{unknown:'field'})).toBe(false)
 })
 it('rejects active-content images, credential links, foreign map embeds and malformed upload references',()=>{
  for(const image_url of ['javascript:alert(1)','data:image/svg+xml,bad','https://user:pass@example.com/x.jpg','/site-images/../secret.png'])expect(validPageCopy('home',{image_url})).toBe(false)
  expect(validPageCopy('home',{home_map_embed:'https://evil.example/embed'})).toBe(false)
  expect(validPageCopy('home',{home_map_embed:'https://maps.google.com/maps?q=Ayutthaya&output=embed'})).toBe(true)
 })
 it('keeps empty overrides as defaults and limits the total document size',()=>{
  expect(validPageCopy('home',{home_stat_sessions:''})).toBe(true)
  const long=Object.fromEntries(pageFields.home.filter(f=>f.kind==='text'||!f.kind).map(f=>[f.key,'ก'.repeat(Math.min(f.limit,1500))]))
  expect(validPageCopy('home',long)).toBe(false)
 })
 it('changes activity images and text, hides and reorders cards without mutating the original',()=>{
  const original=getActivitiesPageContent('th'),before=JSON.stringify(original)
  const result=applyActivityCopy(original,{title:'หัวข้อใหม่',activity_gallery_cards_0_title:'การ์ดใหม่',activity_gallery_cards_0_image:'https://example.com/new.jpg',activity_card_visible_1:'false',activity_card_order_0:'10'},'th')
  expect(result.hero.title).toBe('หัวข้อใหม่')
  expect(result.gallery.cards).toHaveLength(5)
  expect(result.gallery.cards.at(-1)).toMatchObject({title:'การ์ดใหม่',image:'https://example.com/new.jpg'})
  expect(JSON.stringify(original)).toBe(before)
 })
 it('uses language-specific defaults in the same activity layout',()=>{
  expect(applyActivityCopy(getActivitiesPageContent('en'),{},'en').gallery.cards[0].title).toBe('Monk Chat at Wat Mahathat')
 })
 it('resolves uploaded paths in a batch without saving temporary signed URLs into the source',async()=>{
  const reference='/site-images/00000000-0000-4000-8000-000000000001/00000000-0000-4000-8000-000000000002.png'
  const copy={image_url:reference}
  storage.sign.mockResolvedValue({data:[{path:reference.slice('/site-images/'.length),signedUrl:'https://example.com/temporary'}],error:null})
  expect(await resolveSiteImages(copy)).toEqual({image_url:'https://example.com/temporary'})
  expect(copy.image_url).toBe(reference)
 })
 it('does not pretend image resolution succeeded when storage denied access',async()=>{
  storage.sign.mockResolvedValue({data:null,error:{message:'denied'}})
  await expect(resolveSiteImages({image_url:'/site-images/00000000-0000-4000-8000-000000000001/00000000-0000-4000-8000-000000000002.png'})).rejects.toThrow('imageLoad')
 })
})
