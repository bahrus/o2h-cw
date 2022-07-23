import {o2h} from '../node_modules/o2h/o2h';
import {html} from '../node_modules/may-it-be/html';
import o2hConfig from './o2hConfig.json' assert {type: 'json'};
import { O2HConfig } from 'o2h';



export function doO2H(sw: (s: string) => void, obj: any, config: O2HConfig) : Promise<void>{
  return new Promise((resolve) => {
    const instance = o2h(obj, sw, config);
    if(instance.done) {
      resolve();
      return;
    }
    instance.addEventListener('done', e => {
      resolve();
    });
  });
} 

export default {
  async fetch(request: Request): Promise<Response> {
    const configQryP = "o2h-config-url";
    const url = request.url;

    const strippedOfProtocol = url.replace('https://', '').replace('http://', '');
    const idxOfSlash = strippedOfProtocol.indexOf("/");
    const rest = unescape(strippedOfProtocol.substring(idxOfSlash + 1));
    if(rest.length < 1){
      const dest = 'https://unpkg.com/o2h-cw/demo/o2h-view.html';
      return Response.redirect(dest, 301)
    }
    const newUrl = rest;
    const response = await fetch(newUrl);
    const contentType = response.headers.get('content-type');
    console.log({contentType});
    if(contentType && contentType.indexOf('application/json') >= 0){
        const json = await response.json();
        const arr: string[] = [];

        const sw = function(s: string){
          arr.push(s);
        }
        let config = o2hConfig as any as O2HConfig;
        const u = new URL(url);
        const configOverride = u.searchParams.get(configQryP);
        console.log('configOverride = ' + configOverride);
        if(configOverride !== null && configOverride !== 'https://unpkg.com/o2h-cw/src/o2hConfig.json'){
          //TODO:  cache
          const resp = await fetch(configOverride);
          const txt = await resp.text();
          config = JSON.parse(txt);
        }
        await doO2H(sw, json, config);
        return new Response(arr.join(''), {
          headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'content-type': 'text/html;charset=UTF-8',
          }
        });

    }
    return(response);
    
  },
};

const snippets = {
  headerStyle: html`
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
          @import "https://unpkg.com/open-props@1.3.16";
          @import "https://unpkg.com/open-props@1.3.16/normalize.min.css";
          @import "https://unpkg.com/open-props/buttons.min.css";
          label{
            display: block;
          }
    </style>
  `,
}
