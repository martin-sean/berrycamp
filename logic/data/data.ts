import city from "data/rooms/city.json";
import core from "data/rooms/core.json";
import epilogue from "data/rooms/epilogue.json";
import farewell from "data/rooms/farewell.json";
import prologue from "data/rooms/prologue.json";
import reflection from "data/rooms/reflection.json";
import resort from "data/rooms/resort.json";
import ridge from "data/rooms/ridge.json";
import site from "data/rooms/site.json";
import summit from "data/rooms/summit.json";
import temple from "data/rooms/temple.json";
import {DataTree} from './dataTree';

export const DATA: DataTree = {
  celeste: {
    id: "Celeste",
    name: "Celeste",
    chapters: {
      prologue,
      city,
      site,
      resort,
      ridge,
      temple,
      reflection,
      summit,
      epilogue,
      core,
      farewell,
    }
  }
};