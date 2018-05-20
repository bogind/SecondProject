
			// Add OpenStreetMap and thunderforest tile layers variables
				
				var OSM = L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
				{attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
				
				var Thunderforest_neighbourhood = L.tileLayer('https://{s}.tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=278544e7c2664b7cb3d23b7433e96f5c', {
				attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
				apikey: '278544e7c2664b7cb3d23b7433e96f5c',
				maxZoom: 22,
				minZoom: 12
				});
				
				var Thunderforest_transport_dark = L.tileLayer('https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=278544e7c2664b7cb3d23b7433e96f5c',{
				apikey: '278544e7c2664b7cb3d23b7433e96f5c',
				maxZoom: 22,
				minZoom: 12
				});
				
				
				// creating a group layer for the tiles
				
				var baseMaps = {
				"<span style='color: #777777'>Open Street Map</span>": OSM,
				"<span style='color: #478547'>Thunderforest neighbourhood</span>": Thunderforest_neighbourhood,
				"<span style='color: #478547'>Thunderforest <span style='color: #2b2b73'>Transport</span></span>": Thunderforest_transport_dark
				};
				
				// Function to create the popups for the GeoJSON layer
				
				function onEachFeature(feature, layer) {
				if (feature.properties && feature.properties.NUM_timedi) {
				layer.bindPopup(
								"<b># of Obs: </b>" + 
								feature.properties.NUM_timedi + 
								"</br><b> Mean Time Variation: </b>" + 
								
								// rounded to create more informative popups
								
								Math.round(feature.properties.AVG_timedi*10)/10 + 
								" Minutes" + 
								"</br> <b>Range of obs: </b>" + 
								feature.properties.Range +
								" Minutes");
					}
				}
				
				// Read GeoJSON into a named variable, add the popup function and the styling function
				
				var BsStats = L.geoJSON(BSstat, {
				onEachFeature: onEachFeature,
				style: function(feature) {
					if(feature.properties.NUM_timedi > 0){
						if(feature.properties.AVG_timedi <= -1) {
							return {color: "#2eb82e", fillOpacity: 0.3, weight: 0.2};
							}	
						else if(feature.properties.AVG_timedi >= 1){				
							return {color: "#b30000", fillOpacity: 0.3, weight: 0.2};
							}
						else if(feature.properties.AVG_timedi < 1 && feature.properties.AVG_timedi > -1){
							return {color: "#33ccff", fillOpacity: 0.3, weight: 0.2};
							}
						}
					else{
						return {color: "gray", fillOpacity: 0.6, weight: 0.3};
						}
					}
				});
				
				// create a group layer for the layer to appear in the layer contols
				
				var BS = {
				"<span style='color: #008ae6'>Be'er Sheva Mean Time Variation</span>": BsStats
				};			

				// create map object
				
				var map = L.map('map', 
				{center: [31.251155, 34.790096], 
				zoom: 13,
				layers: [Thunderforest_neighbourhood, BsStats]});
				
				// Add Control objects to map
				
				L.control.layers(baseMaps, BS).addTo(map);
				
				// Add Measure tool in a Control object
				
				var measureControl = new L.Control.Measure({
					primaryLengthUnit: 'meters',
					secondaryLengthUnit: 'kilometers',
					primaryAreaUnit: 'sqmeters',
					secondaryAreaUnit: 'hectares'
				});
				
				
				measureControl.addTo(map);

				L.control.mousePosition().addTo(map);
				
				
				
				var cartoDBUserName = "bogind";
				var sqlQuery = null;
				var polygons = null;
				
				// adding the buttons for the queries
				
				L.Control.addearly = L.Control.extend(
					{
						options:
						{
							position: 'topleft',
						},
						onAdd: function (map) {
							var controlDiv = L.DomUtil.create('input', 'leaflet-draw-toolbar leaflet-bar');
							controlDiv.type="button";
							controlDiv.title = 'Show only areas with early buses';
							controlDiv.value = 'Early';
							controlDiv.style.backgroundColor = 'white';     
							controlDiv.style.height = '30px';
							controlDiv.style.width = '65px';
							L.DomEvent
							.addListener(controlDiv, 'click', function () {
							
								sqlQuery = "SELECT * FROM bswgs2 WHERE avg_timedi < -1 AND num_timedi > 0";
			
							// Remove Other versions of layer
								if(map.hasLayer(polygons)){
									map.removeLayer(polygons);
								};
							
								// Get GeoJSON with SQL query
								$.getJSON("https://" + cartoDBUserName +
											".carto.com/api/v2/sql?format=GeoJSON&q=" + 
											sqlQuery, function(data) {
									polygons = L.geoJSON(data, {
										onEachFeature: function (feature, layer) {
											layer.bindPopup( "Mean Time Variation: "+
															feature.properties.avg_timedi +
															"</br>Time Variation Range: "+
															feature.properties.range);
										}
									}).addTo(map);
								});
							});

							var controlUI = L.DomUtil.create('a', 'leaflet-draw-edit-remove', controlDiv);
							controlUI.title = 'Show only areas with early buses';
							controlUI.href = '#';
							controlUI.value = 'Early'
							return controlDiv;
						}
					});
					
					var addearlycontrol = new L.Control.addearly();
					map.addControl(addearlycontrol);
					
				
				L.Control.addlate = L.Control.extend(
					{
						options:
						{
							position: 'topleft',
						},
						onAdd: function (map) {
							var controlDiv = L.DomUtil.create('input', 'leaflet-draw-toolbar leaflet-bar');
							controlDiv.type="button";
							controlDiv.title = 'Show only areas with late buses';
							controlDiv.value = 'Late';
							controlDiv.style.backgroundColor = 'white';     
							controlDiv.style.height = '30px';
							controlDiv.style.width = '65px';
							L.DomEvent
							.addListener(controlDiv, 'click', function () {
							
								sqlQuery = "SELECT * FROM bswgs2 WHERE avg_timedi > 1 AND num_timedi > 0";
			
							// Remove Other versions of layer
								if(map.hasLayer(polygons)){
									map.removeLayer(polygons);
								};
							
								// Get GeoJSON with SQL query
								$.getJSON("https://" + cartoDBUserName +
											".carto.com/api/v2/sql?format=GeoJSON&q=" + 
											sqlQuery, function(data) {
									polygons = L.geoJSON(data, {
										onEachFeature: function (feature, layer) {
											layer.bindPopup( "Mean Time Variation: "+
															feature.properties.avg_timedi +
															"</br>Time Variation Range: "+
															feature.properties.range);
										}
									}).addTo(map);
								});
							});

							return controlDiv;
						}
					});
					
					var addlatecontrol = new L.Control.addlate();
					map.addControl(addlatecontrol);
					
					
					L.Control.removeall = L.Control.extend(
					{
						options:
						{
							position: 'topleft',
						},
						onAdd: function (map) {
							var controlDiv = L.DomUtil.create('input', 'leaflet-draw-toolbar leaflet-bar');
							controlDiv.type="button";
							controlDiv.title = 'Remove data from queries';
							controlDiv.value = 'Remove';
							controlDiv.style.backgroundColor = 'white';     
							controlDiv.style.height = '30px';
							controlDiv.style.width = '65px';
							L.DomEvent
							L.DomEvent
							.addListener(controlDiv, 'click', function () {
							
								sqlQuery = "";
			
							// Remove Other versions of layer
								if(map.hasLayer(polygons)){
									map.removeLayer(polygons);
								};
							
								// Get GeoJSON with SQL query

							});

							return controlDiv;
						}
					});
					
					var removeboth = new L.Control.removeall();
					map.addControl(removeboth);
				
		
		