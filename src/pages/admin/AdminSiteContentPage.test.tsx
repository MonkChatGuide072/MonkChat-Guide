import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminSiteContentPage } from './AdminSiteContentPage'

const fixtures=vi.hoisted(()=>({rows:[] as unknown[],rpc:vi.fn(),profile:{id:'00000000-0000-4000-8000-000000000001',role:'owner',is_active:true},i18n:{resolvedLanguage:'th',language:'th'}}))
vi.mock('../../lib/auth',()=>({useAuth:()=>({profile:fixtures.profile})}))
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:fixtures.i18n})}))
vi.mock('../../lib/supabase',()=>({supabaseClient:{
 from:()=>({select:()=>({eq:()=>({eq:async()=>({data:fixtures.rows,error:null})})})}),
 rpc:fixtures.rpc,
 storage:{from:()=>({createSignedUrls:async(paths:string[])=>({data:paths.map(path=>({path,signedUrl:'https://example.invalid/image/'+path})),error:null})})}
}}))
const draft={section:'home',language_code:'th',stage:'draft',content:{image_url:'https://example.invalid/test.png',tagline:'keep this text'},updated_at:'2026-11-26T08:00:00Z',revision:1}
beforeEach(()=>{
 vi.clearAllMocks();vi.spyOn(window,'confirm').mockReturnValue(true);fixtures.rows=[draft]
 fixtures.rpc.mockImplementation(async(_name,args)=>({data:{...draft,content:args.p_content},error:null}))
})
async function banner(){const image=await screen.findByRole('img',{name:'รูปแบนเนอร์ ภาพตัวอย่าง'});return within(image.closest('.site-image-field') as HTMLElement)}

describe('restore website images without publishing',()=>{
 it('returns an uploaded draft to the project image and only saves on request',async()=>{
  render(<AdminSiteContentPage/>);const field=await banner()
  fireEvent.click(field.getByRole('button',{name:'คืนรูปเดิม'}))
  expect(fixtures.rpc).not.toHaveBeenCalled()
  await waitFor(()=>expect(field.getByRole('img')).toHaveAttribute('src','/images/home/monkchat-banner-desktop.webp'))
  fireEvent.click(screen.getByRole('button',{name:'บันทึกฉบับร่าง'}))
  await waitFor(()=>expect(fixtures.rpc).toHaveBeenCalled())
  expect(fixtures.rpc.mock.calls[0][1]).toMatchObject({p_content:{tagline:'keep this text'},p_publish:false})
  expect(fixtures.rpc.mock.calls[0][1].p_content.image_url).toBe('/images/home/monkchat-banner-desktop.webp')
 })
 it('restores the published custom image rather than the factory image',async()=>{
  fixtures.rows=[draft,{...draft,stage:'published',content:{image_url:'https://example.invalid/published.png'}}]
  render(<AdminSiteContentPage/>);const field=await banner()
  fireEvent.click(field.getByRole('button',{name:'คืนรูปเดิม'}))
  await waitFor(()=>expect(field.getByRole('img')).toHaveAttribute('src','https://example.invalid/published.png'))
  expect(fixtures.rpc).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button',{name:'บันทึกฉบับร่าง'}))
  await waitFor(()=>expect(fixtures.rpc).toHaveBeenCalled())
  expect(fixtures.rpc.mock.calls[0][1]).toMatchObject({p_content:{image_url:'https://example.invalid/published.png',tagline:'keep this text'},p_publish:false})
 })
 it('keeps the restored selection for retry if saving fails',async()=>{
  fixtures.rpc.mockResolvedValue({data:null,error:{code:'503'}})
  render(<AdminSiteContentPage/>);const field=await banner()
  fireEvent.click(field.getByRole('button',{name:'คืนรูปเดิม'}))
  fireEvent.click(screen.getByRole('button',{name:'บันทึกฉบับร่าง'}))
  expect(await screen.findByRole('alert')).toHaveTextContent('ยังบันทึกไม่สำเร็จ')
  await waitFor(()=>expect(field.getByRole('img')).toHaveAttribute('src','/images/home/monkchat-banner-desktop.webp'))
 })
})



describe('restore the whole page to its currently published content',()=>{
 it('restores images and text together without saving or publishing automatically',async()=>{
  fixtures.rows=[draft,{...draft,stage:'published',content:{image_url:'https://example.invalid/live.png',tagline:'live tagline',title:'Live heading'}}]
  render(<AdminSiteContentPage/>);await banner()
  fireEvent.click(screen.getByRole('button',{name:'คืนค่าทั้งหน้า'}))
  expect(fixtures.rpc).not.toHaveBeenCalled()
  expect(screen.getByDisplayValue('live tagline')).toBeInTheDocument()
  expect(screen.getByDisplayValue('Live heading')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'บันทึกฉบับร่าง'}))
  await waitFor(()=>expect(fixtures.rpc).toHaveBeenCalled())
  expect(fixtures.rpc.mock.calls[0][1]).toMatchObject({p_content:{image_url:'https://example.invalid/live.png',tagline:'live tagline',title:'Live heading'},p_publish:false,p_expected_updated_at:draft.updated_at})
 })
 it('uses original project content when no published override exists',async()=>{
  render(<AdminSiteContentPage/>);await banner()
  fireEvent.click(screen.getByRole('button',{name:'คืนค่าทั้งหน้า'}))
  expect(screen.queryByDisplayValue('keep this text')).not.toBeInTheDocument()
  expect(fixtures.rpc).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button',{name:'บันทึกฉบับร่าง'}))
  await waitFor(()=>expect(fixtures.rpc).toHaveBeenCalled())
  expect(fixtures.rpc.mock.calls[0][1]).toMatchObject({p_content:{},p_publish:false})
 })
 it('preserves the current edits if the reset is cancelled',async()=>{
  vi.spyOn(window,'confirm').mockReturnValue(false)
  render(<AdminSiteContentPage/>);await banner()
  fireEvent.click(screen.getByRole('button',{name:'คืนค่าทั้งหน้า'}))
  expect(screen.getByDisplayValue('keep this text')).toBeInTheDocument()
  expect(fixtures.rpc).not.toHaveBeenCalled()
 })
})

describe('save feedback beside the action buttons',()=>{
 it('shows a busy button and nearby success only after the service confirms saving',async()=>{
  let complete!:(value:unknown)=>void
  fixtures.rpc.mockReturnValue(new Promise(resolve=>{complete=resolve}))
  render(<AdminSiteContentPage/>);await banner()
  fireEvent.click(screen.getByRole('button',{name:'บันทึกฉบับร่าง'}))
  expect(screen.getByRole('button',{name:'กำลังบันทึกร่าง…'})).toBeDisabled()
  expect(screen.getByText('กำลังบันทึกฉบับที่แก้ไข กรุณารอสักครู่…')).toBeInTheDocument()
  expect(screen.queryByText('บันทึกฉบับร่างแล้ว หน้าสาธารณะยังใช้ฉบับเผยแพร่เดิม')).not.toBeInTheDocument()
  complete({data:draft,error:null})
  await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('บันทึกฉบับร่างแล้ว'))
  expect(screen.getByRole('status').closest('.site-editor-actions')).not.toBeNull()
  expect(screen.getByRole('button',{name:'บันทึกฉบับร่าง'})).toBeEnabled()
 })
})
