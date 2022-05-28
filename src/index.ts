import {o2h} from '../node_modules/o2h/o2h';
import {html} from '../node_modules/may-it-be/html';
import {MayItBe as mib} from '../node_modules/may-it-be/types';
import json from './usageConfig.json' assert {type: 'json'};
import o2hConfig from './o2hConfig.json' assert {type: 'json'};
import {Usage} from '../types';
import { O2HConfig } from 'o2h';

const suggestedUsage: Usage = {
  baseProxy: 'https://api.nasa.gov',
  o2hConfigPath: 'https://unpkg.com/o2h-cw@0.0.0/src/o2hConfig.json',
  Accept: 'text/html'
};
export function doUsage(sw: (s: string) => void) : Promise<void>{
  console.log(json);
  return new Promise((resolve) => {

    const instance = o2h(suggestedUsage, sw, json as O2HConfig);
    instance.addEventListener('done', e => {
      resolve();
    });
  });
}

export function doO2H(sw: (s: string) => void, obj: any, config: O2HConfig) : Promise<void>{
  return new Promise((resolve) => {
    const instance = o2h(obj, sw, config);
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
    if(!request.headers.has('baseProxy')){

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
          label {
            display: block;
          }
    </style>
  </head>
  <body>
    ${arr.join('\n')}

    <form action=neo/rest/v1/feed target=[-innerHTML] ${{
      beReformable: {
        headerFormSelector: '#usage',
        headerFormSubmitOn: 'input',
      }
    } as mib}>
      <input name=api_key value=SDaBXo5Jpx9S7h6r79ki7bxqVJZZKKnTcOn6WRNq>
      <label for='start_date'>From:</label>
        <input be-persistent type='date' id='start_date' name='start_date' required>
        <label for='end_date'>To:</label>
        <input required be-persistent be-observant='{
            "min": {"observe": "#start_date",  "on": "input", "vft": "value"}
        }' type='date' id='end_date' name='end_date'>
    </form>
    <div -innerHTML id=target></div>
    <script type=module>
      import 'https://esm.run/be-reformable@0.0.46';
    </script>
  </body>
</html>
         
      `; 
      return new Response(responseStr, {
        headers: {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'content-type': 'text/html;charset=UTF-8',
        }
      }); 
    }
    const h = request.headers;
    const usage: Usage = {
      baseProxy: h.get('baseProxy')!,
      Accept: h.get('Accept')!,
      o2hConfigPath: h.get('o2hConfigPath')!,
    };
    
    const reduced = request.url.replace("https://", "");
    const idxOfSlash = reduced.indexOf("/");
    const rest = reduced.substring(idxOfSlash + 1);
    const url = usage.baseProxy + "/" + rest;
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    if(contentType && contentType.indexOf('application/json') >= 0){
      if(usage.Accept.indexOf('text/html') !== -1){
        const json = await response.json();
        const arr: string[] = [];

        const sw = function(s: string){
          arr.push(s);
        }
        let config: O2HConfig = o2hConfig as O2HConfig;
        if(usage.o2hConfigPath !== suggestedUsage.o2hConfigPath){
          const configResponse = await fetch(usage.o2hConfigPath);
          config = await configResponse.json();
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
    }
    return(response);
    
  },
};
