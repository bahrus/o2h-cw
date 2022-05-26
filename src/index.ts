import {o2h} from '../node_modules/o2h/o2h';

export function doUsage(sw: (s: string) => void) : Promise<void>{
  return new Promise((resolve, reject) => {
    const usage = {
      proxyURL: 'https://example.com/proxy',
    }
    const instance = o2h(usage, sw);
    instance.addEventListener('done', e => {
      resolve();
    })
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const arr: string[] = [];

    const sw = function(s: string){
      arr.push(s);
    }

    let responseStr = "Hello World!"
    if(!request.headers.has('proxy-url')){
      await doUsage(sw);
      responseStr = arr.join('\n');
    }

    return new Response(responseStr, {
      headers: {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'content-type': 'text/html;charset=UTF-8',
      }
    });
  },
};
