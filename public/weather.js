import {stableHash} from './traits.js';
import {HOUR} from './pet-life.js';
export function weatherAt(now=Date.now()){const slot=Math.floor(now/(3*HOUR)),id=['sun','rain','cloud','storm'][stableHash('weather-'+slot)%4];return {id,name:{sun:'Сонечко',rain:'Дощик',cloud:'Хмарно',storm:'Гроза'}[id],until:(slot+1)*3*HOUR};}
