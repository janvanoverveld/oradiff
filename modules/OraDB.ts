import * as oracledb from 'oracledb';
import {oracleDdlObject,ddlType} from './various';

class OraDB {

   private constructor(private connection:oracledb.Connection){}
   private getObjectsResolver: ((objects: oracleDdlObject[]) => void) | null = null;
   private getDdlResolver: ((ddl: ddlType) => void) | null = null;

   public static async getOraDb(dbConfig:oracledb.ConnectionAttributes):Promise<OraDB> {
      const promise = new Promise<OraDB>(
        async (resolve, reject) => {
           const connection:oracledb.Connection = await oracledb.getConnection(dbConfig);
           //console.log(`Connection was successful!  ${connection}`);
           //if (!this.connection) throw Error("Connectie maken niet gelukt.");
           const oraDb:OraDB = new OraDB(connection);
           resolve(oraDb);
        }
      );
      return promise;
   }

   public async getObjects(object_name:string):Promise<oracleDdlObject[]> {
       let promise = new Promise<oracleDdlObject[]>((resolve, reject) => { this.getObjectsResolver = resolve; });
       const query =  `select obj.owner, obj.object_type, obj.object_name
                       from  dba_objects obj
                       where obj.object_name = :object_name
                       order by 1,2,3`;
       const result:oracledb.Result<[string]> = await this.connection.execute( query, {object_name:object_name}, { maxRows: 100});
       const rs = result.resultSet;
       let ddlObjects:oracleDdlObject[]|null = null;
       if ( result.rows ) {
         ddlObjects = [];
         for ( let row of result.rows){
            //console.log(`${row}`);
            // @ts-ignore
            const ddlObject:oracleDdlObject = {owner:row[0],type:row[1],name:row[2]}  ;
            ddlObjects.push(ddlObject);
         }
       }
       if ( this.getObjectsResolver && ddlObjects ){
         this.getObjectsResolver(ddlObjects);
       }
       return promise;
   }

   public async getDDL(owner:string, type:string, naam:string):Promise<ddlType>{
       let promise = new Promise<ddlType>((resolve, reject) => { this.getDdlResolver = resolve; });
       const plsql =  `BEGIN
                          DDLER.GETDDL( P_OWNER => :OWNER, P_TYPE => :TYPE, P_NAME => :NAME, P_FILENAME => :filename, P_DDL => :ddl );
                       END;`;

       const bindings = { OWNER: owner
       ,                   TYPE: type
       ,                   NAME: naam
       ,               filename: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 2000     }
       ,                    ddl: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 10000000 }
       };

       // info over clobs in javascript 
       // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#queryinglobs

       // @ts-ignore
       const result:oracledb.Result = await this.connection.execute( plsql, bindings );
       // @ts-ignore
       const source = result.outBinds.ddl as string;
       // @ts-ignore
       const filename = result.outBinds.filename as string;
       const ddl:ddlType={filename:filename,source:source};
       if ( this.getDdlResolver && ddl ){
           //console.log(`filename = ${ddl.filename}`);
           this.getDdlResolver(ddl);
       }
       return promise;
   }

   public async closeConnection(){
       if (this.connection) {
          try {
             await this.connection.close();
          } catch (err) {
             console.error(err);
          }
       }
   }

}

export {OraDB}