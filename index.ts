import * as oracledb from 'oracledb';
import * as fs       from 'fs';
import {databaseConfiguration} from './admin/dbConnectie';

//
// const databaseConfiguration:oracledb.ConnectionAttributes = { user : "username" , password  : "password", connectString : "localhost:31521/HERA" };
//

//https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/oracledb/oracledb-tests.ts


type oracleDdlObject = {
    owner: string;
    type: string;
    name: string;
}

let ddlObjectResolver: ((objects: oracleDdlObject[]) => void) | null = null;

async function getObjects(object_name:string,conn:oracledb.Connection):Promise<oracleDdlObject[]> {
    let promise = new Promise<oracleDdlObject[]>((resolve, reject) => { ddlObjectResolver = resolve; });
    const query =  `select obj.owner, obj.object_type, obj.object_name
                    from  dba_objects obj
                    where obj.object_name = :object_name
                    order by 1,2,3`;
    const result:oracledb.Result<[string]> = await conn.execute( query, {object_name:object_name}, { maxRows: 100});
    const rs = result.resultSet;

    let ddlObjects:oracleDdlObject[] = [];

    if ( result.rows ) {
      for ( let row of result.rows){
         //console.log(`${row}`);
         // @ts-ignore
         const ddlObject:oracleDdlObject = {owner:row[0],type:row[1],name:row[2]}  ;
         ddlObjects.push(ddlObject);
      }
    }

    if ( ddlObjectResolver && result && result.rows && result.rows.length > 0 ){
      ddlObjectResolver(ddlObjects);
    }

    return promise;
}

type ddlType = {
   filename: string;
   source: string;
}

let ddlResolver: ((ddl: ddlType) => void) | null = null;

async function getDDL(owner:string, type:string, naam:string, conn:oracledb.Connection):Promise<ddlType>{
    let promise = new Promise<ddlType>((resolve, reject) => { ddlResolver = resolve; });
    const plsql =  `BEGIN
                       DDLER.GETDDL( P_OWNER => :OWNER, P_TYPE => :TYPE, P_NAME => :NAME, P_FILENAME => :filename, P_DDL => :ddl );
                    END;`;

    const bindings = { OWNER: owner
    ,                   TYPE: type
    ,                   NAME: naam
    ,               filename: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 2000 }
    ,                    ddl: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 }
  };

    const result:oracledb.Result<string> = await conn.execute( plsql, bindings );
    // @ts-ignore
    const source = result.outBinds.ddl as string;
    // @ts-ignore
    const filename = result.outBinds.filename as string;
    const ddl:ddlType={filename:filename,source:source};
    if ( ddlResolver && ddl ){
      console.log(`filename = ${ddl.filename}`);
      ddlResolver(ddl);
    }
    return promise;
}

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

  let connection:oracledb.Connection|null=null;

  try {
    connection = await oracledb.getConnection(databaseConfiguration);
    console.log('Connection was successful!');
    const ddlObjects = await getObjects(object_name, connection);
    ddlObjects.forEach(
        (e) => {
            console.log(`${e.owner}     ${e.type}      ${e.name}`);
        }
    )

    for ( let ddlObj of ddlObjects ){
      console.log(`${ddlObj.owner}:${ddlObj.type}:${ddlObj.name}`);
      const ddl = await getDDL(ddlObj.owner,ddlObj.type,ddlObj.name,connection);
      console.log(`ddl = ${ddl.source}`);
      await writeDdlFile(ddl.filename, ddl.source);
    }

    //console.log(ddlObjects);
  } catch (err) {
      console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
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
