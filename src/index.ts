import {o2h} from '../node_modules/o2h/o2h';
import {html} from '../node_modules/may-it-be/html';
import json from './usageConfig.json' assert {type: 'json'};

export function doUsage(sw: (s: string) => void) : Promise<void>{
  console.log(json);
  return new Promise((resolve) => {
    const usage = {
      proxyURL: 'https://example.com/proxy',
    };
    const instance = o2h(usage, sw, json);
    instance.addEventListener('done', e => {
      resolve();
    });
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
      responseStr = html`
<html>
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
          @import "https://unpkg.com/open-props@1.3.16";
          @import "https://unpkg.com/open-props@1.3.16/normalize.min.css";
          @import "https://unpkg.com/open-props/buttons.min.css";
    </style>
  </head>
  <body>
    ${arr.join('\n')}
  </body>
</html>
         
      `;  
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
