
require(["DS/DataDragAndDrop/DataDragAndDrop", "DS/PlatformAPI/PlatformAPI", "DS/WAFData/WAFData", "DS/i3DXCompassServices/i3DXCompassServices"], 
	function(DataDragAndDrop, PlatformAPI, WAFData, BaseUrl) {
		
		securityContext= "ctx%3A%3AVPLMProjectLeader.BU-0000001.Rosemount%20Flow";
		var form = "";
		var comWidget = {
			widgetDataSelected: {},
	
			onLoad: function() { 
                console.log("Entering On Load Function--->");
                var mainDiv = widget.createElement('div', { 'id' : 'mainDiv' });
				form = widget.createElement('form', { 'id' : 'myForm' });
				
				// Create form Level fields
				var LevelLable = document.createElement('label',{'for':'LevelDropdown'});
				LevelLable.textContent = 'Select Level: ';
				form.appendChild(LevelLable);
				console.log("Entering On Load Function--->222222");
				var LevelDropdown = widget.createElement('select', {'id': 'LevelDropdown', 'name': 'LevelDropdown'});

				let options = ['Create New Product', 'Modify Product','Delete Product'];
				for (var i = 0; i < options.length; i++) {
				  var option = widget.createElement('option');
				  option.text = options[i];
				  LevelDropdown.appendChild(option);
				}
				form.appendChild(LevelDropdown);

				var DomainlLable = document.createElement('label',{'for':'DomainDropdown'});
				DomainlLable.textContent = 'Select Domain: ';
				form.appendChild(DomainlLable);

				var DomainDropdown = widget.createElement('select', {'id': 'DomainDropdown', 'name': 'DomainDropdown'});
				var DomainOptions = ['01', '02','03','04','06'];
				for (var i = 0; i < DomainOptions.length; i++) {
				  var option = widget.createElement('option');
				  option.text = options[i];
				  DomainDropdown.appendChild(option);
				}
				form.appendChild(DomainDropdown);

				
				var ActionLable = document.createElement('label',{'for':'ActionDropdown'});
				ActionLable.textContent = 'Select Action: ';
				form.appendChild(ActionLable);

				var ActionDropdown = widget.createElement('select', {'id': 'ActionDropdown', 'name': 'ActionDropdown'});

				// Create empty option
				var emptyOption = widget.createElement('option');
				emptyOption.value = '';
				emptyOption.selected = true;
				ActionDropdown.appendChild(emptyOption);

				var ActionDropdown = ['Add New', 'Modify', 'Delete'];
				for (var i = 0; i < DomainOptions.length; i++) {
				  var option = widget.createElement('option');
				  option.text = options[i];
				  ActionDropdown.appendChild(option);
				}
				form.appendChild(ActionDropdown);


				// Add event listener to action type 
				ActionDropdown.addEventListener('change', ()=> {
					var selectedValue = LevelDropdown.value;
					alert("selectedValue----->"+selectedValue);
					comWidget.addActions();
				});
				form.appendChild(ActionDropdown);


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
			addActions: function() { 
				
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
