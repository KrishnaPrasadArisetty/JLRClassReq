import fetch from 'node-fetch';
import makeFetchCookie from 'fetch-cookie'
import https from 'https';
import config from './config.json' assert { type: 'json' };

const env = config[config.Current_env];

const fetchCookie = makeFetchCookie(fetch);
const agent = new https.Agent({
  rejectUnauthorized: false,
});
async function getReadyFetchInstance() {
  return new Promise(async (resolve, reject) => {
      
      const myHeaders = new Headers();
      
      myHeaders.append("Accept", "application/json");

      const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
          credentials: "include",
          rejectUnauthorized: false,
          agent,
      };

      let response = await fetchCookie(env.TRMpassport+env.ltTockenPath, requestOptions,new https.Agent({
        rejectUnauthorized: false,
      }))

      let body = await response.json();
      let ltTicket = body.lt;
      console.log("---->"+ltTicket);

      const myHeaders1 = new Headers();
      myHeaders1.append("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
      const raw = "lt=" + ltTicket + "&username="+env.username+"&password="+env.password;
      const requestOptions1 = {
          method: "POST",
          headers: myHeaders1,
          body: raw,
          redirect: "follow",
          rejectUnauthorized: false,
          agent,
      };

      let response1 = await fetchCookie(env.TRMpassport+env.loginPath, requestOptions1)
      let body1 = await response1.text();

      const raw2 = {
        "Type_Pattern": "iPLMSSARequirement",
        "Name_Pattern": "req-430138048-00010542",
        "Revision_Pattern": "*",
        "Owner_Pattern": "",
        "Vault_Pattern": "",
        "Object_Where": "",
        "Expand_Type": "",
        "Object_Selects": ""
       }
      const myHeaders2 = new Headers();
      myHeaders2.append("Content-Type", "application/json");

      const requestOptions3 = {
        method: "POST",
        headers: myHeaders2,
        body: JSON.stringify(raw2),
        redirect: "follow",
        credentials: "include",
        rejectUnauthorized: false,
        agent,
      };

      let response2 = await fetchCookie(env.TRMspace+env.findObjectsPath, requestOptions3)
      let body2 = await response2.json();
      console.log("body2bbbb---->"+body2);
      
      //----
      /*
      const myHeaders4 = new Headers();
  myHeaders4.append("Content-Type", "application/json");
  const raw4 = {
    //"ObjectId": "",
    "Relationship_Pattern": "Specification Structure,Sub Requirement,Derived Requirement",
    "Type_Pattern": "Chapter",
    "Object_Selects": "physicalid$attribute[Title]",
    "Relationship_Selects": "",
    "Get_To": "true",
    "Get_From": "false",
    "Recurse_Level": "1",
    "Object_Where": "",
    "Relationship_Where": "",
    "Limit": "0"
  }
  const requestOptions4 = {
    method: "POST",
    headers: myHeaders4,
    //body: JSON.stringify(raw2),
    redirect: "follow",
    credentials: "include",
    rejectUnauthorized: false,
    agent,
  };

  for (let i = 0; i < body2.length; i++) {
    const item = body2[i];
    let ObjectID = item.id;
    console.log("ObjectID--->"+ObjectID);
    raw4.ObjectId = ObjectID;
    requestOptions4.body = JSON.stringify(raw4)
    let response4 = await fetchCookie(env.TRMspace+env.expandObjects, requestOptions4)
    let body4 = response4.json();
    body4.then((value) => {
      console.log("iii9990----->"+JSON.stringify(value)); // logs the resolved value
    });
  }
  */
      //----
      resolve(body2);
  })
};



async function mainModule(){
  const findObjects = await getReadyFetchInstance();
  
  const myHeaders4 = new Headers();
  myHeaders4.append("Content-Type", "application/json");
  const raw4 = {
    //"ObjectId": "",
    "Relationship_Pattern": "Specification Structure,Sub Requirement,Derived Requirement",
    "Type_Pattern": "Chapter",
    "Object_Selects": "physicalid$attribute[Title]",
    "Relationship_Selects": "",
    "Get_To": "true",
    "Get_From": "false",
    "Recurse_Level": "1",
    "Object_Where": "",
    "Relationship_Where": "",
    "Limit": "0"
  }
  const requestOptions4 = {
    method: "POST",
    headers: myHeaders4,
    //body: JSON.stringify(raw2),
    redirect: "follow",
    credentials: "include",
    rejectUnauthorized: false,
    agent,
  };

  for (let i = 0; i < findObjects.length; i++) {
    const item = findObjects[i];
    let ObjectID = item.id;
    console.log("ObjectID--->"+ObjectID);
    raw4.ObjectId = ObjectID;
    requestOptions4.body = JSON.stringify(raw4)
    let response4 = await fetchCookie(env.TRMspace+env.expandObjects, requestOptions4)
    let body4 = response4.text();
    body4.then((value) => {
     // console.log("iii9990----->"+JSON.stringify(value)); // logs the resolved value
     console.log("iii9990----->"+value);
    });
  }
    
}
mainModule();