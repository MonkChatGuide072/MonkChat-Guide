import { useEffect, useRef, useState } from 'react'
import { supabaseClient } from '../../lib/supabase'
import { resolveSiteImages, validImageReference } from '../../lib/siteContent'

export function SiteImageField({label,value,onChange,disabled,userId,english,onUploadState,onRestore,canRestore=false}:{label:string;value:string;onChange:(value:string)=>void;disabled:boolean;userId:string;english:boolean;onUploadState:(busy:boolean)=>void;onRestore?:()=>void;canRestore?:boolean}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[preview,setPreview]=useState(''),[previewBusy,setPreviewBusy]=useState(false)
 const epoch=useRef(0)
 useEffect(()=>{const ticket=++epoch.current;if(!value||!validImageReference(value)){setPreview('');setPreviewBusy(false);return}setPreviewBusy(true)
  void resolveSiteImages({image_url:value}).then(copy=>{if(ticket===epoch.current)setPreview(copy.image_url||'')}).catch(()=>{if(ticket===epoch.current)setError(english?'Image preview could not be loaded.':'โหลดภาพตัวอย่างไม่ได้')}).finally(()=>{if(ticket===epoch.current)setPreviewBusy(false)})
  return()=>{if(ticket===epoch.current)epoch.current=ticket+1}
 },[value,english])
 return <div className="site-image-field"><strong>{label}</strong>
  {preview&&<img src={preview} alt={`${label} ${english?'preview':'ภาพตัวอย่าง'}`} className="site-image-preview"/>}
  <label className="site-upload">{english?'Choose an image from your device':'เลือกรูปจากเครื่อง'}<input aria-label={`${label} ${english?'upload':'อัปโหลด'}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled||busy} onChange={async e=>{
   const file=e.target.files?.[0];e.target.value='';if(!file)return
   setError('');if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3*1024*1024){setError(english?'Choose JPG, PNG or WebP up to 3 MB.':'เลือกรูป JPG PNG หรือ WebP ไม่เกิน 3 MB');return}
   if(!supabaseClient||!userId){setError(english?'Sign in before uploading.':'กรุณาเข้าสู่ระบบก่อนอัปโหลด');return}
   const ticket=++epoch.current;setBusy(true);onUploadState(true)
   try{const image=await createImageBitmap(file);if(!image.width||!image.height)throw new Error('image');image.close()
    const ext=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp'
    const path=`${userId}/${crypto.randomUUID()}.${ext}`
    const {error}=await supabaseClient.storage.from('site-images').upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'})
    if(error)throw error
    if(ticket===epoch.current)onChange('/site-images/'+path)
   }catch{if(ticket===epoch.current)setError(english?'Upload failed. Your previous image is unchanged.':'อัปโหลดไม่สำเร็จ รูปเดิมยังไม่เปลี่ยน')}
   finally{setBusy(false);onUploadState(false)}
  }}/></label>
  {onRestore&&<button type="button" className="access-btn site-image-restore" disabled={disabled||busy||!canRestore} onClick={()=>{setError('');onRestore()}}>{english?'Restore previous image':'คืนรูปเดิม'}</button>}
  {onRestore&&<small>{english?'Restores the published image, or the original project image. Save the draft to keep this change.':'คืนรูปที่เผยแพร่อยู่ หรือรูปเริ่มต้นของเว็บ แล้วกดบันทึกฉบับร่างเพื่อเก็บการเปลี่ยนแปลง'}</small>}
  {previewBusy&&!busy&&<p role="status">{english?'Loading image preview…':'กำลังโหลดภาพตัวอย่าง…'}</p>}
  <small>{english?'JPG, PNG or WebP · up to 3 MB. Uploading does not publish the image.':'JPG PNG หรือ WebP ไม่เกิน 3 MB อัปโหลดแล้วต้องบันทึกและเผยแพร่จึงแสดงต่อผู้มาเยือน'}</small>
  {busy&&<p role="status">{english?'Uploading…':'กำลังอัปโหลด…'}</p>}{error&&<p role="alert">{error}</p>}
  <details className="site-image-link"><summary>{english?'Use an image link instead':'ใช้ลิงก์รูปภาพแทน'}</summary><label className="access-field">{label} {english?'link':'ลิงก์รูป'}<input value={value} disabled={disabled||busy} maxLength={1000} onChange={e=>{setError('');onChange(e.target.value)}}/></label></details>
 </div>
}
