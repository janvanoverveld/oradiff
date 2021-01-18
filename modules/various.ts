import * as fs from 'fs';

type oracleDdlObject = {
    owner: string;
    type: string;
    name: string;
}

export {oracleDdlObject}

type ddlType = {
    filename: string;
    source: string;
}

export {ddlType}

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

export {writeDdlFile}

