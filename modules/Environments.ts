import {EnvFile,Connect} from './EnvFile';
import * as fs from 'fs';
import * as oracledb from 'oracledb';

const environmentJsonFile = 'env.json';

class Environments {

    private static environments:Environments|null = null;

    private aliases:string[] = [];
    private connecties:Map<string,Connect> = new Map<string,Connect>();
    private oraConnections:Map<string,oracledb.ConnectionAttributes> = new Map<string,oracledb.ConnectionAttributes>();

    private constructor(private envFile:EnvFile){
       envFile.environments.forEach( (e) => {
          this.aliases.push(e.alias);
          this.connecties.set(e.alias,e.connect);
          this.oraConnections.set( e.alias, { user          : e.connect.user
                                            , password      : e.connect.password
                                            , connectString : e.connect.connectString } );
       });
    }

    public static getEnvironments():Environments {

       if (!Environments.environments){
         const buffer = fs.readFileSync(environmentJsonFile);
         const json:EnvFile = JSON.parse(buffer.toString());
         //console.log(`env.json = ${JSON.stringify(json)}`);
         Environments.environments = new Environments(json);
       }

       return Environments.environments
    }

    public getEnv():EnvFile{
      return this.envFile;
    }

    public getAliases():string[]{
      return this.aliases;
    }

    public getConnection(alias:string):Connect{
       const connection = this.connecties.get(alias);
       if ( connection ){
         return connection;
       }
       throw new Error(`Alias ${alias} is incorrect`);
    }

    public getOraConnection(alias:string):oracledb.ConnectionAttributes{
      const connection = this.oraConnections.get(alias);
      if ( connection ){
        return connection;
      }
      throw new Error(`Alias ${alias} is incorrect`);
   }

}

const environments:Environments = Environments.getEnvironments();

export {environments}
