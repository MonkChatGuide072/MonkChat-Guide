import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminSiteContentPage } from './AdminSiteContentPage'
import { PublishedLinks } from '../../components/PublishedLinks'
import { usePublicPageCopy } from '../../lib/siteContent'
const mocks=vi.hoisted(()=>({ profile:{id:'owner',role:'owner',is_active:true}, rows:[] as unknown[], error:null as Error|null, eq:vi.fn(), rpc:vi.fn(), from:vi.fn() }))
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'en'},t:(key:string)=>key})}))
vi.mock('../../lib/auth',()=>({useAuth:()=>({profile:mocks.profile})}))
vi.mock('../../lib/supabase',()=>({supabaseClient:{
 from:(table:string)=>{mocks.from(table);const q={select:()=>q,eq:(...args:unknown[])=>{mocks.eq(...args);return q},is:()=>q,order:()=>q,maybeSingle:async()=>({data:mocks.rows[0]??null,error:mocks.error}),then:(resolve:(r:unknown)=>unknown,reject?:(e:unknown)=>unknown)=>Promise.resolve({data:mocks.rows,error:mocks.error}).then(resolve,reject)};return q},rpc:mocks.rpc,
}}))
beforeEach(()=>{
 vi.clearAllMocks();mocks.profile={id:'owner',role:'owner',is_active:true};mocks.rows=[];mocks.error=null
 mocks.rpc.mockImplementation(async(_name,body)=>({data:{section:body.p_section,language_code:body.p_language,stage:'draft',content:body.p_content,updated_at:'2026-11-24T02:00:00Z',revision:1},error:null}))
})
describe('website publication flow',()=>{
 it('saves a draft and publishes only after explicit review',async()=>{
  render(<AdminSiteContentPage/>);const draft=screen.getByRole('button',{name:'Save draft'});await waitFor(()=>expect(draft).toBeEnabled())
  fireEvent.change(screen.getByRole('textbox',{name:/Heading/}),{target:{value:'Reviewed introduction'}})
  expect(screen.getByRole('button',{name:'Save & publish'})).toBeDisabled()
  fireEvent.click(draft);await screen.findByText('Draft saved. Public content is unchanged.')
  expect(mocks.rpc).toHaveBeenCalledWith('save_site_page_content',expect.objectContaining({p_publish:false,p_content:{title:'Reviewed introduction'},p_expected_updated_at:null}))
  fireEvent.click(screen.getByRole('checkbox',{name:/I reviewed/}));fireEvent.click(screen.getByRole('button',{name:'Save & publish'}))
  await screen.findByText('Published. Open the public page to check the result.')
  expect(mocks.rpc).toHaveBeenLastCalledWith('save_site_page_content',expect.objectContaining({p_publish:true,p_expected_updated_at:'2026-11-24T02:00:00Z'}))
 })
 it('does not report success when another editor changed the draft',async()=>{
  mocks.rpc.mockResolvedValue({data:null,error:{code:'40001'}})
  render(<AdminSiteContentPage/>);await waitFor(()=>expect(screen.getByRole('button',{name:'Save draft'})).toBeEnabled())
  fireEvent.click(screen.getByRole('button',{name:'Save draft'}));expect(await screen.findByRole('alert')).toHaveTextContent('content changed')
  expect(screen.queryByText('Draft saved. Public content is unchanged.')).not.toBeInTheDocument()
 })
 it('blocks students before accessing the content editor',()=>{
  mocks.profile.role='student';render(<AdminSiteContentPage/>);expect(screen.getByRole('alert')).toHaveTextContent('Access denied');expect(mocks.from).not.toHaveBeenCalled()
 })
 it('public views explicitly load only the published copy',async()=>{
  mocks.rows=[{content:{title:'Public revision'}}]
  function Visitor(){const copy=usePublicPageCopy('home','en');return<h1>{copy.title||'Default'}</h1>}
  render(<Visitor/>);await screen.findByRole('heading',{name:'Public revision'})
  expect(mocks.eq).toHaveBeenCalledWith('stage','published')
 })
 it('shows safe published visitor links using the selected language',async()=>{
  mocks.rows=[{id:'safe',url:'https://example.com/info',bio_link_translations:[{language_code:'th',title:'ข้อมูล'},{language_code:'en',title:'Information'}]},{id:'unsafe',url:'javascript:alert(1)',bio_link_translations:[{language_code:'en',title:'Unsafe'}]}]
  render(<PublishedLinks language="en"/>);expect(await screen.findByRole('link',{name:'Information'})).toHaveAttribute('href','https://example.com/info')
  expect(screen.queryByText('Unsafe')).not.toBeInTheDocument();expect(mocks.eq).toHaveBeenCalledWith('content_status','published')
 })
 it('shows a retry when visitor links fail to load',async()=>{
  mocks.error=new Error('offline');render(<PublishedLinks language="en"/>);await screen.findByText('Useful links could not be loaded.')
  mocks.error=null;mocks.rows=[{id:'safe',url:'https://example.com',bio_link_translations:[{language_code:'en',title:'Restored'}]}]
  fireEvent.click(screen.getByRole('button',{name:'Retry'}));await screen.findByRole('link',{name:'Restored'})
 })
})
