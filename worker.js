const PDFS = {
  'AM': 'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/para-colaboradores-y-empresas/autoescuelas/CUADERNILLO-FORMACION-DGT-AM.pdf',
  'A1/A2': 'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/para-colaboradores-y-empresas/autoescuelas/CUADERNILLO-FORMACION-DGT-A1-Y-A2.pdf',
  'B': 'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/para-colaboradores-y-empresas/autoescuelas/CUADERNILLO-FORMACION-DGT-B.pdf',
  'C1/C': 'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/para-colaboradores-y-empresas/autoescuelas/CUADERNILLO-FORMACION-DGT-C1-C.pdf',
  'D1/D': 'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/para-colaboradores-y-empresas/autoescuelas/CUADERNILLO-FORMACION-DGT-PERMISOS-D1-y-D.pdf'
};

async function serveDgtPdf(request) {
  const url = new URL(request.url);
  const permit = url.searchParams.get('permit') || '';
  const source = PDFS[permit];
  if (!source) return new Response('Permiso no válido', { status: 400 });

  const cache = caches.default;
  const cacheKey = new Request(url.origin + '/__dgt_cache__/' + encodeURIComponent(permit), request);
  let response = await cache.match(cacheKey);
  if (response) return response;

  const upstream = await fetch(source, {
    headers: { 'User-Agent': 'FichaAutoescuela/1.0' }
  });
  if (!upstream.ok) return new Response('No se pudo obtener el PDF oficial', { status: 502 });

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  headers.set('Content-Disposition', `inline; filename="DGT-${permit.replaceAll('/', '-')}.pdf"`);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Access-Control-Allow-Origin', '*');

  response = new Response(upstream.body, { status: 200, headers });
  await cache.put(cacheKey, response.clone());
  return response;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/dgt-pdf' && request.method === 'GET') {
      return serveDgtPdf(request);
    }
    return env.ASSETS.fetch(request);
  }
};
