import fetch from 'node-fetch';
import makeFetchCookie from 'fetch-cookie';
import https from 'https';
import config from './config.json' assert { type: 'json' };
import Excel from 'exceljs';
import JSONStream from 'JSONStream';

var GlobalMap = {};
const env = config[config.Current_env];
const TRM_PASSPORT = env.TRMpassport;
const FIND_OBJECTS_PATH = env.findObjectsPath;
const Expand_OBJECTS_PATH = env.expandObjects;
const fetchCookie = makeFetchCookie(fetch);

async function getLTToken() {
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    redirect: 'follow',
    credentials: 'include',
    rejectUnauthorized: false,
    agent: new https.Agent({ rejectUnauthorized: false }),
  };

  const response = await fetchCookie(TRM_PASSPORT + env.ltTockenPath, requestOptions,new https.Agent({rejectUnauthorized: false,}));
  const body = await response.json();
  console.log("Login Ticket------->"+body.lt);
  return body.lt;
}

async function login() {
  const ltToken = await getLTToken();

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: `lt=${ltToken}&username=${env.username}&password=${env.password}`,
    redirect: 'follow',
    rejectUnauthorized: false,
    agent: new https.Agent({ rejectUnauthorized: false }),
  };

  const response = await fetchCookie(TRM_PASSPORT + env.loginPath, requestOptions);
  const body = await response.text();
  console.log("body--Login----->"+body);
}


async function callWebService(method,url,reqBody){
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: reqBody,
            redirect: 'follow',
            credentials: 'include',
            rejectUnauthorized: false,
            agent: new https.Agent({ rejectUnauthorized: false }),
        };
        fetchCookie(url, requestOptions)
        .then(response => {
            resolve(response);
        })
        .catch(error => {
            console.log("<----Error in WebService--->");
        });
    });
}

async function processChapter(id,finalPath,finalIds){
    return new Promise((resolve, reject) => {
    const expbody = {
        "Relationship_Pattern": "Specification Structure",
        "Type_Pattern": "Chapter,Requirement",
        "Object_Selects": "physicalid$attribute[Title]",
        "Relationship_Selects": "",
        "Get_To": "false",
        "Get_From": "true",
        "Recurse_Level": "1",
        "Object_Where": "",
        "Relationship_Where": "",
        "Limit": "",
        "ObjectId": id
    };
    callWebService("POST", env.TRMspace + Expand_OBJECTS_PATH, JSON.stringify(expbody))
    .then(response => {
        const dataStream = response.body.pipe( JSONStream.parse('*'));
        let processingCount = 0;
        dataStream.on('data', async (item) => {
            processingCount++;
            console.log("Processing---chap---->"+JSON.stringify(item));
            const currentPath  = finalPath;
            const currentIds  = finalIds;
            const childID = item.physicalid;
            const childName = item.name;
            if (!currentIds.includes(childID)) {
                await (item.type === "Chapter" ? processChapter(childID,currentPath+"-->"+childName,currentIds+","+childID) :
                processRequirement(childID,currentPath,currentIds+","+childID));
                processingCount--;
                if (processingCount === 0) {
                    resolve();
                }
            } else {               
                GlobalMap[childID] = GlobalMap[childID] ? 
                {...GlobalMap[childID], ChapterRecursion: true, path: GlobalMap[childID].path+","+currentPath } : 
                {ChapterRecursion: true, path: currentPath};
                resolve();
            }
                  
        });
        dataStream.on('error', (error) => {
            console.error('Error processing data stream:', error);
        });
        
        dataStream.on('end', () => {
            //---------
            resolve();
        });
    });
});
}

async function processRequirement(id,finalPath,finalIds){
    return new Promise((resolve, reject) => {
    const expbody = {
        "Relationship_Pattern": "Sub Requirement",
        "Type_Pattern": "Requirement",
        "Object_Selects": "physicalid$attribute[Title]",
        "Relationship_Selects": "",
        "Get_To": "false",
        "Get_From": "true",
        "Recurse_Level": "1",
        "Object_Where": "",
        "Relationship_Where": "",
        "Limit": "",
        "ObjectId": id
    };
    callWebService("POST", env.TRMspace + Expand_OBJECTS_PATH, JSON.stringify(expbody))
    .then(response => {
        const dataStream = response.body.pipe( JSONStream.parse('*'));
        let processingCount = 0;
        dataStream.on('data', async (item) => {
            console.log("Processing---req---->"+JSON.stringify(item));
            processingCount++;
            const currentPath  = finalPath;
            const currentIds  = finalIds;
            const childID = item.physicalid;
            const childName = item.name;
            if (!currentIds.includes(childID)) {
                await processRequirement(childID,currentPath,currentIds+","+childID);
                processingCount--;
                if (processingCount === 0) {
                    resolve();
                }
            } else {               
                GlobalMap[childID] = GlobalMap[childID] ? 
                {...GlobalMap[childID], ChildRecursion: true, path: GlobalMap[childID].path+","+currentPath } : 
                {ChildRecursion: true, path: currentPath};
                resolve();
            }

        });
        dataStream.on('error', (error) => {
            console.error('Error processing data stream:', error);
        });
        
        dataStream.on('end', () => {
            //---------
            resolve();
        });
    });
});
}

var childChapter = [];
async function expandRSP(id,rspName){
    return new Promise((resolve, reject) => {
        const expbody = {
            "Relationship_Pattern": "Specification Structure",
            "Type_Pattern": "Chapter,Requirement",
            "Object_Selects": "physicalid$attribute[Title]",
            "Relationship_Selects": "",
            "Get_To": "false",
            "Get_From": "true",
            "Recurse_Level": "1",
            "Object_Where": "",
            "Relationship_Where": "",
            "Limit": "",
            "ObjectId": id
        };
        callWebService("POST", env.TRMspace + Expand_OBJECTS_PATH, JSON.stringify(expbody))
        .then(response => {
            const dataStream = response.body.pipe( JSONStream.parse('*'));
            dataStream.on('data', async (item) => {
                console.log("Processing---CHild---->" + JSON.stringify(item));
                const childID = item.physicalid;
                const childName = item.name;
                await (item.type === "Chapter" ? processChapter(childID, rspName + "-->" + childName, childID) :
                 processRequirement(childID, rspName + "-->" + childName, childID));
           
            });
            dataStream.on('error', (error) => {
                console.error('Error processing data stream:', error);
            });
            
            dataStream.on('end', () => {
                //---------
            });
        });
    });
}

async function searchObjects() {  
    const searchCriteria = {
    Type_Pattern: 'iPLMSSARequirementSpecification,Requirement*Specification',
    Name_Pattern: 'rsp-5256403-00013398',
    Revision_Pattern: '*',
    Owner_Pattern: '',
    Vault_Pattern: '',
    Object_Where: '',
    Expand_Type: '',
    Object_Selects: 'name',
    };
    console.error("Final----Log-1-->"+JSON.stringify(GlobalMap));
    callWebService("POST", env.TRMspace + FIND_OBJECTS_PATH, JSON.stringify(searchCriteria))
    .then(response => {
        const dataStream = response.body.pipe(JSONStream.parse('*'));
        dataStream.on('data', async (item) => {
            console.log("Processing----RSP--->"+item.id);
            await expandRSP(item.id,item.name);
        });
        dataStream.on('error', (error) => {
            console.error('Error processing data stream:', error);
        });
        dataStream.on('end', () => {
            console.error("Final----Log-end-->"+JSON.stringify(GlobalMap));
        });
        
    });
}

async function mainModule() {
  try {
    await login();
    await searchObjects();
    
  } catch (error) {
    console.error(error);
  }
}

mainModule();