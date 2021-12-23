#!/usr/bin/env node
import * as fs from "fs";

let baseDom = fs.readFileSync("C:\\11.txt").toString();
let base = JSON.parse(baseDom);
let candidateDom = fs.readFileSync("C:\\22.txt").toString();
let candidate = JSON.parse(candidateDom);
console.log(base['tagName']);
console.log(candidate['tagName']);
console.log(diff(base, candidate));

function diff(obj1, obj2) {
  const result = {};
  if (Object.is(obj1, obj2)) {
      return undefined;
  }
  if (!obj2 || typeof obj2 !== 'object') {
      return obj2;
  }
  
  let tag1 = obj1['tagName'];
  let tag2 = obj1['tagName'];
  if(tag1 != tag2)
  {
    console.log(`${tag1} ${tag2}`);
  }

  let props1:Object[] = obj1['computeds'];
  let props2:Object[] = obj2['computeds'];
  let keys1:string[] =Object.keys(props1 || {});
  let keys2:string[] =Object.keys(props2 || {});
  let set:Set<string> = new Set<string>(keys1);
  for(let kk of keys2)
  {
    set.add(kk);
  }
  for (const key of Array.from(set)) {
    if(props2[key] !== props1[key] && !Object.is(props1[key], props2[key])) {
      console.log(obj1['tagName'] +"  "+key +" Before = "+props2[key] +" After = "+props1[key]);
    }
  }
  let childs1:Object[] = obj1['children'];
  let childs2:Object[] = obj2['children'];
  for(let i=0;i<childs1.length;i++)
  {
    diff(childs1[i],childs2[i]);
  }
  return result;
}

/*function diff(obj1, obj2) {
  const result = {};
  if (Object.is(obj1, obj2)) {
      return undefined;
  }
  if (!obj2 || typeof obj2 !== 'object') {
      return obj2;
  }
  Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
      if(obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
          result[key] = obj2[key];
      }
      if(typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
          const value = diff(obj1[key], obj2[key]);
          if (value !== undefined) {
              result[key] = value;
          }
      }
  });
  return result;
}*/