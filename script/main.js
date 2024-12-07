
require(["DS/DataDragAndDrop/DataDragAndDrop", "DS/PlatformAPI/PlatformAPI", "DS/WAFData/WAFData", "DS/i3DXCompassServices/i3DXCompassServices"], 
	function(DataDragAndDrop, PlatformAPI, WAFData, BaseUrl) {
		
		securityContext= "ctx%3A%3AVPLMProjectLeader.BU-0000001.Rosemount%20Flow";
		var form = "";
		var comWidget = {
			widgetDataSelected: {},
	
			onLoad: function() { 
                console.log("Entering On Load Function");
                var mainDiv = widget.createElement('div', { 'id' : 'mainDiv' });
				form = widget.createElement('form', { 'id' : 'myForm' });
				
				// Create form fields
				var ActionLable = document.createElement('label',{'for':'actionType'});
				ActionLable.textContent = 'Select Action: ';
				form.appendChild(ActionLable);
				
				var selectDropdown = widget.createElement('select', {'id': 'actionType', 'name': 'actionType'});
				// Create empty option
				var emptyOption = widget.createElement('option');
				emptyOption.value = '';
				emptyOption.selected = true;
				selectDropdown.appendChild(emptyOption);

				var options = ['Create New Product', 'Modify Product','Delete Product'];
				for (var i = 0; i < options.length; i++) {
				  var option = widget.createElement('option');
				  option.text = options[i];
				  selectDropdown.appendChild(option);
				}
				// Add event listener to action type 
				selectDropdown.addEventListener('change', ()=> {
					var selectedValue = selectDropdown.value;
					// Perform action based on selected value
					alert("selectedValue------------"+selectedValue);
					comWidget.addDomains();
				});
				form.appendChild(selectDropdown);


				var ssubDiv = widget.createElement('div', { 'id' : 'ssubDiv'});
				ssubDiv.style = "display: flex; justify-content: flex-end";
				var savebutton = document.createElement('button', {'class':'dynamic-button'});
				savebutton.style = "border-radius: 4px; padding: 5px 20px; font-size: 12px; text-align: center; margin: 10px; background-color: #368ec4; color: white; border: none; cursor: pointer";
				savebutton.innerHTML = 'save';
				ssubDiv.appendChild(savebutton);


				mainDiv.appendChild(form);
				mainDiv.appendChild(ssubDiv);
				widget.body.innerHTML="";
				widget.body.appendChild(mainDiv);

			},
			addDomains: function() { 
								// Create form fields
								let DomainLable = document.createElement('label',{'for':'Domains'});
								DomainLable.textContent = 'select domain: ';
								form.appendChild(DomainLable);
								
								let Domains = widget.createElement('select', {'id': 'Domains', 'name': 'Domains'});
								// Create empty option
								let emptyOption = widget.createElement('option');
								emptyOption.value = '';
								emptyOption.selected = true;
								Domains.appendChild(emptyOption);
				
								var options = ['01', '02','03'];
								for (var i = 0; i < options.length; i++) {
								  var option = widget.createElement('option');
								  option.text = options[i];
								  Domains.appendChild(option);
								}
								// Add event listener to action type 
								Domains.addEventListener('change', ()=> {
									var selectedValue = Domains.value;
									// Perform action based on selected value
									alert("selectedValue------------"+selectedValue);
									comWidget.addDomains();
								});
								form.appendChild(Domains);
			},
			callwebService: function(methodWAF,urlObjWAF,data) {
				var headerWAF = {
					SecurityContext: securityContext,
					Accept: "application/json"
				};
				let kp;
				let dataResp=WAFData.authenticatedRequest(urlObjWAF, {
					method: methodWAF,
					headers: headerWAF,
					data: data,
					type: "json",
					async : false,
					onComplete: function(dataResp) {
						kp=dataResp;
						console.log("kp--CallWebService--- >> ",kp);
					},
					onFailure: function(error, backendresponse, response_hdrs) {
						console.log(backendresponse);
						console.log(response_hdrs);
						widget.body.innerHTML += "<p>Something Went Wrong"+error+"</p>";
					}
				})
				
				return kp;
			},
			exportTable: function(filename){
				
				
			},
			
			setBaseURL: function() {
				BaseUrl.getServiceUrl( { 
					platformId:  widget.getValue('x3dPlatformId'),
					serviceName: '3DSpace', 
					onComplete :  function (URLResult) {
						urlBASE = URLResult+"/";
						console.log("aaaaaaaaaaaaaaaaa-1111-----URL",urlBASE);
						comWidget.setCSRF();
					},
					onFailure:  function( ) { alert("Something Went Wrong");
					}
				}) ; 
			},
	
			setCSRF: function() {
				console.log("aaaaaaaaaaaaaaaaa-2222-----URL");
				// Web Service call to get the crsf token (security) for the current session
				let urlWAF = urlBASE+"resources/v1/application/CSRF";
				let dataWAF = {};
				let headerWAF = {};
				let methodWAF = "GET";
				let dataResp=WAFData.authenticatedRequest(urlWAF, {
					method: methodWAF,
					headers: headerWAF,
					data: dataWAF,
					type: "json",
					async : false,
					onComplete: function(dataResp) {
						// Save the CSRF token to a hidden widget property so it can be recalled
						let csrfArr=dataResp["csrf"];
						csrfToken = csrfArr["value"];
						console.log("aaaaaaaaaaaaaaaaa------csrfToken",csrfToken);
					},
					onFailure: function(error) {
						widget.body.innerHTML += "<p>Something Went Wrong- "+error+"</p>";
						widget.body.innerHTML += "<p>" + JSON.stringify(error) + "</p>";
					}
				});
			},
			getPartDetails: function(PartId) {
				
			}
		};
		widget.addEvent('onLoad', comWidget.onLoad);
		widget.addEvent('onRefresh', comWidget.onLoad);
	});
