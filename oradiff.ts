import * as fs       from 'fs';
import {environments} from './modules/Environments';
import {OraDB} from './modules/OraDB';
/*
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

function printHelp(){
  console.log(`
     The program oraget is used for getting ddl code from an oracle database and save it as a text file.
     The program oraget returs the ddl source code in the folder ./generatedSourceCode

     node js/oraget parA parB
     parA = name of ddl object in Oracle database
     parB = the initial of the environment (P=production, T=test, D=development)

     examples for calling oraget are:
     node js/oraget DUMMY_PKG      -- get the package spec and body from DUMMY_PKG from production
     node js/oraget DUMMY_PKG P    -- get the package spec and body from DUMMY_PKG from production
     node js/oraget DUMMY_PKG T    -- get the package spec and body from DUMMY_PKG from test
     node js/oraget DUMMY_PKG D    -- get the package spec and body from DUMMY_PKG from development
  `);
}

function starter(pars:string[]){

  //console.log(`${pars}`);
  if ( !pars[2] ) {
      console.log(`There are no parameters specified, try 'node js/oradiff help' for more information.`);
      return;
  }

  if ( pars[3] && pars[3]) {
    console.log(`There are no parameters specified, try 'node js/oradiff help' for more information.`);
    return;
  }

  if (pars[2].toLowerCase() === 'help' ) {
    printHelp();
    return;
}

  run(pars[2].toUpperCase());

}

starter(process.argv);
*/