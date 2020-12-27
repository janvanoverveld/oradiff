import {OraDB} from './OraDB';
import {writeDdlFile} from './various';
import {environments} from './Environments';

class DDLRetriever {

   public constructor(private objectname:string, private environment:string){}

   public async get() {
     console.log(`start    ${new Date()}   voor object ${this.objectname} `);
     try {
       const dbconfig = environments.getOraConnection(this.environment.toUpperCase());
       if (!dbconfig) throw Error("geen config voor db");
       const devDB:OraDB = await OraDB.getOraDb(dbconfig);
       const ddlObjects = await devDB.getObjects(this.objectname);
       if ( !ddlObjects || ddlObjects.length < 1){
           console.log(`There are no objects named ${this.objectname} in the  ${this.environment} environment`);
           return;
       }
       ddlObjects.forEach(
           (e) => {
               console.log(`${e.owner}     ${e.type}      ${e.name}`);
           }
       )

       for ( let ddlObj of ddlObjects ){
         console.log(`${ddlObj.owner}:${ddlObj.type}:${ddlObj.name}`);
         const ddl = await devDB.getDDL(ddlObj.owner,ddlObj.type,ddlObj.name);
         console.log(`ddl = ${ddl.source}`);
         const filename = `${this.environment.toUpperCase()}_${ddl.filename}`;
         await writeDdlFile(filename, ddl.source);
       }

       devDB.closeConnection();
     } catch (err) {
         console.error(err);
     }
     console.log(`eind    ${new Date()} `);
   }

}

export {DDLRetriever}