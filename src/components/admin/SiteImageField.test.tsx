import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { SiteImageField } from './SiteImageField'
const mocks=vi.hoisted(()=>({upload:vi.fn()}))
vi.mock('../../lib/supabase',()=>({supabaseClient:{storage:{from:()=>({upload:mocks.upload})}}}))
const options={label:'รูปกิจกรรม',value:'/images/old.jpg',disabled:false,userId:'00000000-0000-4000-8000-000000000001',english:false}
beforeEach(()=>{
 vi.clearAllMocks();vi.stubGlobal('createImageBitmap',vi.fn().mockResolvedValue({width:120,height:80,close:vi.fn()}))
 mocks.upload.mockResolvedValue({data:{path:'uploaded'},error:null})
})
describe('website image upload',()=>{
 it('rejects unsupported files before uploading',async()=>{
  const change=vi.fn();render(<SiteImageField {...options} onChange={change} onUploadState={vi.fn()}/>)
  fireEvent.change(screen.getByLabelText('รูปกิจกรรม อัปโหลด'),{target:{files:[new File(['bad'],'bad.svg',{type:'image/svg+xml'})]}})
  expect(await screen.findByRole('alert')).toHaveTextContent('JPG PNG หรือ WebP')
  expect(mocks.upload).not.toHaveBeenCalled();expect(change).not.toHaveBeenCalled()
 })
 it('uploads a new immutable path and reports only the storage reference',async()=>{
  const change=vi.fn(),busy=vi.fn();render(<SiteImageField {...options} onChange={change} onUploadState={busy}/>)
  fireEvent.change(screen.getByLabelText('รูปกิจกรรม อัปโหลด'),{target:{files:[new File(['png'],'image.png',{type:'image/png'})]}})
  await waitFor(()=>expect(change).toHaveBeenCalledWith(expect.stringMatching(/^\/site-images\/00000000-0000-4000-8000-000000000001\/[0-9a-f-]+\.png$/)))
  expect(mocks.upload).toHaveBeenCalledWith(expect.stringMatching(/\.png$/),expect.any(File),expect.objectContaining({upsert:false,contentType:'image/png'}))
  expect(busy).toHaveBeenLastCalledWith(false)
 })
 it('retains the previous selection and clears busy state on upload failure',async()=>{
  mocks.upload.mockResolvedValue({data:null,error:{message:'denied'}})
  const change=vi.fn(),busy=vi.fn();render(<SiteImageField {...options} onChange={change} onUploadState={busy}/>)
  fireEvent.change(screen.getByLabelText('รูปกิจกรรม อัปโหลด'),{target:{files:[new File(['png'],'image.png',{type:'image/png'})]}})
  expect(await screen.findByRole('alert')).toHaveTextContent('รูปเดิมยังไม่เปลี่ยน')
  expect(change).not.toHaveBeenCalled();expect(busy).toHaveBeenLastCalledWith(false)
 })
})
