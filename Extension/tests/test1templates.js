	var pTemplate1 = { 
				url: "https://www.facebook.com/login/", 
				title: "Log into Facebook | Facebook", 
				retryInterval:1, 
				maxRetries:30, 
				elements: [
					{ 
						find: { type: "name", value: "login" },
					},
					{ 
						find: { type: "id", value: "email" },
						actions: [ { type: "text", value: "email@yahoo.com" } ],
					},
					{ 
						find: { type: "id", value: "pass" },
						actions: [ { type: "text", value: "testpassword" } ],
					},
					{
						find: { type: "name", value: "login" },
						actions: [ { type: "click" } ],
					},
				],
			};
	var pTemplate2 = { 
				url: "https://www.instagram.com/accounts/login/", 
				title: "*", 
				retryInterval:5, 
				maxRetries:3, 
				elements: [
					{ 
						find: { type: "xpath", value: "//*[@id=\"react-root\"]/section/main/div/article/div/div[1]/div/form/div[1]/input" },
						actions: [ { type: "text", value: "testusername" } ],
					},
					{ 
						find: { type: "xpath", value: "//*[@id=\"react-root\"]/section/main/div/article/div/div[1]/div/form/div[2]/input" },
						actions: [ { type: "text", value: "testpassword" } ],
					},
					{
						find: { type: "xpath", value: "//*[@id=\"react-root\"]/section/main/div/article/div/div[1]/div/form/div[2]/input" },
						actions: [ { type: "enable", value: false }, { type: "delay", value: "1000" } ],
					},
					{
						find: { type: "xpath", value: "//*[@id=\"react-root\"]/section/main/div/article/div/div[1]/div/form/div[2]/input" },
						actions: [ { type: "enable", value: true }, { type: "delay", value: "1000" } ],
					},
					{
						find: { type: "xpath", value: "//*[@id=\"react-root\"]/section/main/div/article/div/div[1]/div/form/span/button" },
						actions: [ { type: "click" } ],
					},
				],
			};
	var pTemplate3 = { 
				url: "https://twitter.com/login?lang=en", 
				title: "Login on Twitter", 
				retryInterval:5, 
				maxRetries:3, 
				elements: [
					{ 
						find: { type: "xpath", value: "//*[@id=\"page-container\"]/div/div[1]/form/fieldset/div[1]/input" },
						actions: [ { type: "text", value: "testusername" } ],
					},
					{ 
						find: { type: "xpath", value: "//*[@id=\"page-container\"]/div/div[1]/form/fieldset/div[2]/input" },
						actions: [ { type: "text", value: "testpassword" } ],
					},
					{
						find: { type: "xpath", value: "//*[@id=\"page-container\"]/div/div[1]/form/div[2]/button" },
						actions: [ { type: "click" } ],
					},
				],
			};
	var pTemplate4 = { 
				url: "http://sergii-pc/test2.html", 
				title: "*", 
				retryInterval:5, 
				maxRetries:3, 
				elements: [
					{ 
						find: { type: "id", value: "selectbyvalue" },
						actions: [ { type: "select", byValue: "saab" } ],
					},
					{ 
						find: { type: "id", value: "selectbydisplay" },
						actions: [ { type: "select", byDisplay: "Mercedes" } ],
					},
					{ 
						find: { type: "id", value: "setcheck" },
						actions: [ { type: "checkbox", selected: "false" } ],
					},
					{ 
						find: { type: "id", value: "selectbydisplay" },
						actions: [ { type: "keypress", value: "a" } ],
					},
				],
			};
	var pTemplate5 = { 
				"url": "https://www.hipchat.com/sign_in",
				"title": "Log in | HipChat",
				"retryInterval": 1,
				"maxRetries": 5,
				"elements": [
					{
						"find": {
							"type": "id",
							"value": "signin"
						}
					},
					{
						"find": {
							"type": "id",
							"value": "email"
						},
						"actions": [
							{
								"type": "text",
								"value": "soryshchenko@idauto.net"
							}
						]
					},
					{
						"find": {
							"type": "xpath",
							"value": "//*[@id=\"signin\"]"
						},
						"actions": [
							{
								"type": "click"
							}
						]
					}
				]
			};
	var pTemplate6 = { 
				"url": "https://www.hipchat.com/login_password*",
				"title": "Log in | HipChat",
				"retryInterval": 1,
				"maxRetries": 5,
				"elements": [
					{
						"find": {
							"type": "id",
							"value": "signin"
						}
					},
					{
						"find": {
							"type": "id",
							"value": "password"
						},
						"actions": [
							{
								"type": "text",
								"value": "ENTER_YOUR_PASSWORD"
							}
						]
					},
					{
						"find": {
							"type": "id",
							"value": "signin"
						},
						"actions": [
							{
								"type": "click"
							}
						]
					}
				]
			};
	var pTemplate7 = { 
				"url": "http://httpbin.org/basic-auth/testuser/testpass8",
				"title": "",
				"retryInterval": 0,
				"maxRetries": 0,
				"elements": [
					{ 
						find: { type: "httpBasicAuth" },
						actions: [ { type: "httpBasicAuth", username: "testuser", password: "testpass8" } ],
					},
				]
			};
	var pTemplate8 = { 
				url: "http://sergii-pc/test5.html", 
				title: "*", 
				retryInterval:5, 
				maxRetries:3, 
				elements: [
					{ 
						find: { type: "id", value: "frame11" },
						actions: [ { type: "text", value: "email@yahoo.com" } ],
					},
				],
			};
	var pTemplate9 = { 
				url: "https://minnetonka.na.rapidbiz.com/cloud/login.do?mode=loadLoginScreen&appId=1&orgId=5", 
				title: "VACAVA RapidBiz", 
				retryInterval:5, 
				maxRetries:3, 
				elements: [
					{ 
						find: { type: "id", value: "TextField_1" },
						actions: [ { type: "text", value: "username#1" } ],
					},
					{ 
						find: { type: "id", value: "TextField_2" },
						actions: [ { type: "text", value: "password#1" } ],
					},
					{
						find: { type: "id", value: "Button_1" },
						actions: [ { type: "click" } ],
					},
				],
			};
	var pTemplate10 = { 
				url: "https://www.amazon.com/ap/signin?*", 
				title: "*", 
				retryInterval:1, 
				maxRetries:1, 
				elements: [
					{ 
						find: { type: "xpath", value: "//*[@id=\"ap_email\"]" },
						actions: [ { type: "text", value: "testemail@test.com" } ],
					},
					{ 
						find: { type: "name", value: "password" },
						actions: [ { type: "text", value: "testpassword" } ],
					},
					{ 
						find: { type: "class", value: "a-button-input" },
						actions: [ { type: "click" } ],
					},
				],
			};
	var pTemplate11 = { 
				url: "https://login.frontlineeducation.com/login*", 		//https://adminweb.aesoponline.com/access
				title: "*", 
				retryInterval:5, 
				maxRetries:3, 
				elements: [
					{ 
						find: { type: "id", value: "Username" },
						actions: [ { type: "text", value: "9524015031" }, { type: "sendEvent", event: "change" } ],
					},
					{ 
						find: { type: "id", value: "Password" },
						actions: [ { type: "text", value: "2778" }, { type: "sendEvent", event: "change" } ],
					},
					{ 
						find: { type: "id", value: "qa-button-login" },
						actions: [ { type: "click" } ],
					},
				],
			};
	var pTemplate12 = { 
				url: "https://www.pinterest.com/login*", 
				title: "*", 
				retryInterval:5, 
				maxRetries:3, 
				elements: [
					{ 
						find: { type: "xpath", value: "/html/body/div[1]/div/div[1]/div/div/div/div/div/div[3]/form/fieldset[1]/input" },
						actions: [ { type: "text", value: "test@mail.com" }, { type: "sendEvent", event: "input" } ],
					},
					{ 
						find: { type: "xpath", value: "/html/body/div[1]/div/div[1]/div/div/div/div/div/div[3]/form/fieldset[2]/input" },
						actions: [ { type: "text", value: "testpass" }, { type: "sendEvent", event: "input" } ],
					},
					{ 
						find: { type: "xpath", value: "/html/body/div[1]/div/div[1]/div/div/div/div/div/div[3]/form/button" },
						actions: [ { type: "click" } ],
					},
				],
			};
	var pTemplate13 = { 
				"url": "https://httpbin.org/basic-auth/testuser1*",			//https://httpbin.org/basic-auth/testuser11/testpass11
				"title": "",
				"retryInterval": 0,
				"maxRetries": 0,
				"elements": [
					{ 
						find: { type: "httpBasicAuth" },
						actions: [ { type: "httpBasicAuth", username: "testuser11", password: "testpass11" } ],
					},
				]
			};
	var pTemplates = [ pTemplate1, pTemplate2, pTemplate3, pTemplate4, pTemplate5, pTemplate6, pTemplate7, pTemplate8, pTemplate9, pTemplate10, pTemplate11, pTemplate12, pTemplate13 ];
