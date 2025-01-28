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


      const CSRFrequestOptions = {
          method: "GET",
          headers: "",
          redirect: "follow",
          rejectUnauthorized: false,
          agent,
      };

      let CSRFresponse = await fetchCookie(env.TRMspace+env.csrfpath, CSRFrequestOptions)
      let CSRFbody = await CSRFresponse.text();
      console.log("CSRFbody---nnnnnn->"+CSRFbody);
      const jsonData = JSON.parse(CSRFbody);      
      let csrf_Tocken = jsonData["csrf"].value;
      console.log("CSRFbody---nnnnnn->"+csrf_Tocken);

      const raw2 = {
        "data": [
            {
                "tempId": "temp_1736344791169788",
                "updateAction": "CREATE",
                "dataelements": {
                    "title": "KPKPKPKPKPKP",
                    "state": "Create"
                }
            }
        ]
    }
      const myHeaders2 = new Headers();
      myHeaders2.append("Accept-Language", "application/json");
      myHeaders2.append("SecurityContext", "VPLMProjectLeader.Cross-Commodity.Requirements");
      myHeaders2.append("ENO_CSRF_TOKEN",csrf_Tocken);

      const requestOptions3 = {
        method: "POST",
        headers: myHeaders2,
        body: JSON.stringify(raw2),
        redirect: "follow",
        credentials: "include",
        rejectUnauthorized: false,
        agent,
      };

      let response2 = await fetchCookie(env.TRMspace+"/resources/v1/modeler/tasks", requestOptions3,new https.Agent({
        rejectUnauthorized: false,
      }))
      let body2 = await response2.text();
      console.log("body2bbbb---nnnnnn->"+body2);
          
      resolve(body2);
  })
};



async function mainModule(){
  const findObjects = await getReadyFetchInstance();
}
mainModule();