import {DDLRetriever} from './modules/DDLRetriever';
import {environments} from './modules/Environments';

const nwln = "\n";
const pkb  = "DUMMY_PKG";
const exes = "node js/oraget";

function printHelp(){
  let txt:string = 'examples for calling oraget are:' + nwln;
  environments.getEnv().environments.forEach( (e) => {
     if (e.default){
        txt += `${exes} ${pkb}   -- get the package spec and body from ${pkb} from ${e.alias}(${e.name}/${e.description})` + nwln;
     }
  });
  environments.getEnv().environments.forEach( (e) => {
       txt += `${exes} ${pkb} ${e.alias} -- get the package spec and body from ${pkb} from ${e.alias}(${e.name}/${e.description})` + nwln;
  });
  console.log(txt);
}

function starter(pars:string[]){
  //console.log(`${pars}`);
  if (!pars[2]) {
      console.log(`There are no parameters specified, try '${exes} help' for more information.`);
      return;
  }

  if (pars[2].toLowerCase() === 'help' ) {
    printHelp();
    return;
  }

  if (pars[3] && !environments.getAliases().includes(pars[3].toUpperCase())) {
    console.log(`Second parameter should be ${environments.getAliases()}`);
    let messageText:string = '';
    environments.getEnv().environments.forEach( (e) => {
       messageText += `${e.alias}  ${e.name}  ${e.description}  ${(e.default)?"(default)":""}` + nwln;
    });
    console.log(messageText);
    return;
  }

  const environment:string = pars[3]?pars[3].toUpperCase():"P";
  const ddlRetriever:DDLRetriever = new DDLRetriever(pars[2].toUpperCase(),environment);
  ddlRetriever.get();
}

starter(process.argv);