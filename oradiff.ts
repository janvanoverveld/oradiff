import * as fs       from 'fs';
import {environments,connecties} from './admin/dbConnectie';
import {OraDB} from './modules/OraDB';

const writeFile:(path:string,data:string)=>Promise<void> = (p,d) => new Promise( (resolve, reject) => fs.writeFile(p, d, 'utf8', (err) => { if (err) reject(err); else resolve(); }) );

let writeDdlFileResolver:(()=>void)|null = null;
async function writeDdlFile(filename:string,source:string):Promise<void>{
  let promise = new Promise<void>((resolve)=>writeDdlFileResolver=resolve);
  const ddlSourceCodeDir = `./generatedSourceCode/`;

  if (!fs.existsSync(ddlSourceCodeDir)) {
      fs.mkdirSync(ddlSourceCodeDir);
  }

  writeFile(ddlSourceCodeDir+filename,source).then( () => {
    if (writeDdlFileResolver){
      writeDdlFileResolver();
    }
  });

  return promise;
}

async function run(object_name:string) {
  console.log(`start    ${new Date()}   voor object ${object_name} `);

  try {
    const dbconfig = connecties.get(environments.dev);
    if (!dbconfig) throw Error("geen config voor db");
    const devDB:OraDB = await OraDB.getOraDb(dbconfig);
    const ddlObjects = await devDB.getObjects(object_name);
    ddlObjects.forEach(
        (e) => {
            console.log(`${e.owner}     ${e.type}      ${e.name}`);
        }
    )

    for ( let ddlObj of ddlObjects ){
      console.log(`${ddlObj.owner}:${ddlObj.type}:${ddlObj.name}`);
      const ddl = await devDB.getDDL(ddlObj.owner,ddlObj.type,ddlObj.name);
      console.log(`ddl = ${ddl.source}`);
      await writeDdlFile(ddl.filename, ddl.source);
    }

    devDB.closeConnection();
  } catch (err) {
      console.error(err);
  }
  console.log(`eind    ${new Date()} `);
}

function starter(pars:string[]){

  console.log(`${pars}`);
  if (!pars[2]) {
      console.log(`There are no parameters specified, try 'node js/start help' for more information.`);
      return;
  }

  run(pars[2].toUpperCase());

}

starter(process.argv);
