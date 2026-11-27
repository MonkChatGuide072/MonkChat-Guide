interface Env {}

export const onRequest: PagesFunction<Env> = async (context) => {
  const res = await context.next();
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return res;
  }

  const html = await res.text();
  const title = 'MonkChat Guide — พื้นที่ฝึกทักษะพระนิสิต วัดมหาธาตุ อยุธยา';
  const desc = 'ระบบจำลองสถานการณ์บทสนทนาธรรม คลังคำศัพท์ และบทฝึกนำสมาธิภาษาอังกฤษสำหรับพระนิสิต วัดมหาธาตุ พระนครศรีอยุธยา';
  const ogImage = 'https://monkchat-guide.pages.dev/images/og/og-nisit.png';
  const ogUrl = 'https://monkchat-guide.pages.dev/nisit';

  let updated = html
    .replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${desc}" />`)
    .replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${desc}" />`)
    .replace(/<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${ogImage}" />`)
    .replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${ogUrl}" />`)
    .replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${desc}" />`)
    .replace(/<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${ogImage}" />`);

  return new Response(updated, {
    status: res.status,
    headers: res.headers,
  });
};
