window.flag = false;
jQuery(document).ready(function($) {

	var old_h=[], new_h;
	var interval_scan;
	var interval_model; 
	var old_model;

	function arr_diff (a1, a2) {
	    var a = [], diff = [];
	    for (var i = 0; i < a1.length; i++) {
	        a[a1[i]] = true;
	    }
	    for (var i = 0; i < a2.length; i++) {
	        if (a[a2[i]]) {
	            delete a[a2[i]];
	        } else {
	            a[a2[i]] = true;
	        }
	    }
	    for (var k in a) {
	        diff.push(k);
	    }
	    return diff;
	}
	/* For div#detector : */
	function scan() {
		jQuery.ajax({
			type: 'post',
			url: ajax_url.ajax_url,
			data: {
				action: 'file_scan'
			},
			success: function(res){
				new_h = jQuery.parseJSON(res);
				var w, h;
				if(new_h.length == 0) {
					jQuery("#detector").html("No Images"); 
				}
				if(new_h.length == old_h.length) return ;
				else {
					jQuery("#detector").html(""); 
					jQuery("#detector").css('background', 'url('+new_h[0]['url']+') no-repeat scroll center center');
					jQuery('#detector').css('background-size', 'contain'); 
					clearInterval(interval_scan);
					load_model_head();
				}
				old_h = new_h.slice();
			}
		}); 
	}

	jQuery("#apply_select").click(function() {
		jQuery("#upload_pane").hide(); 
		jQuery("#detector").show();
		jQuery("#disable-pane").hide(); 
		old_h = [];
		interval_scan = setInterval(scan, 1000); 
	}); 

	/* For div#upload_pane */
	jQuery("#file_data").change(function(event) {
		console.log(this.files.length);
		if(this.files.length == 0) {
			$("div#gender-wrapper>button").prop('disabled', true);
			return ;
		}
		$("div#gender-wrapper>button").prop('disabled', false);
		window.flag=true;
		$("#detector").css('background', "");
		$("#detector").html("LOADING ... <br>");
		$("#uploadimage").ajaxSubmit({
			url: ajax_url.ajax_url,
			type: 'post',
			success: function(r) {
				if(r[0] == 'h') { // if return is http:// ... [0] Should be 'h' Assumes that No other h- value returns
					$("#detector").css('background', "url("+r+") no-repeat scroll center center");
					$("#detector").css('background-size', 'contain'); 
					$("#upload_pane").css('opacity', 0);
					$("#upload_pane").css('background-color', 'transparent');
					$("#detector").show(); 
					$("#detector").html('');
					jQuery("#upload_pane").mouseover(function() {
						$(this).css('opacity', 1); 
					});
					jQuery("#upload_pane").mouseout(function() {
						$(this).css('opacity', 0); 
					}); 
				} else {
					$("#detector").html("! Error ! <br>" + r);
					$("#detector").css('background', "");
				}
			}
		}); 
	}); 
	jQuery("#upload_pane").mouseover(function() {
		$("#browse-photo").css('background-color', '#aaa'); 
	});
	jQuery("#upload_pane").mouseout(function() {
		$("#browse-photo").css('background-color', '#ccc'); 
	}); 

	status_change(0);

	/*
	Page status change function : Simply hide/show sections on the left panel.    USED WITH CHOOSE ANOTHER OPTION
	*/
	function status_change(flag) {
		if(flag == 0) {
			// Image Select Status
			jQuery("#param-controls").hide();
			jQuery("#cloud-Selection").show(); 
		}
		if(flag == 1) {
			// Settings select status
			jQuery("#param-controls").show();
			jQuery("#cloud-Selection").hide(); 
		}
	}

	function model_scan() {
		jQuery.ajax({
			type: 'post',
			url: ajax_url.ajax_url,
			data: {
				action: 'model_scan'
			},
			success: function(res){
				$("#loading").show();
				$("#loading #complete").html("Waiting for Server process ... "); 
				var files = jQuery.parseJSON(res);
				console.log(files);
				if(!files) return ;
				if(files.length == 0) {
					$("#model-preview").children().remove();
					$("#model-preview").html('3D Model Preview'); 
					return ;
				}
				if(old_model == files[0]) return ;
				// clearInterval(interval_model); 
				console.log("REloading the new "+files[0]); 
				$("#model-preview").children().remove(); 
				clearInterval(interval_model);
				setTimeout(Load_Model, 10000, files[0]); 
			}
		}); 
	}

	function load_model_head() {
		jQuery("#model-preview").html("Model Loading..."); 
		old_model = false;
		interval_model = setInterval(model_scan, 1000); 
	}

	jQuery("#choose-other-picture").click(function() {
		status_change(0);
		$("#detector").css('background', '');
		$("#upload_pane").show();
		$("#upload_pane").css('opacity', '1'); 
		$("#model-preview").children().remove(); 
		$("#model-preview").html('3D Preview'); 
		jQuery("#disable-pane").show(); 
		window.flag = false;
	}); 

	jQuery("#choose-other-option").click(function() {
		status_change(1);
		load_params();
	}); 


/*
Get 3d Object from server directory
*/
	function Load_Model(model_name) {
		var container = $("#model-preview");
		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera(75,container.width()/container.height(), 1,10000);
		var renderer = new THREE.WebGLRenderer();
		var objurl = ajax_url.objurl;
		renderer.setSize(container.width(), container.height());
		container.html(renderer.domElement);
		var geometry = new THREE.BoxGeometry(70, 70, 70, 10, 10, 10);
		var material = new THREE.MeshBasicMaterial({color: 0xfffff, wireframe: true});
		var cube = new THREE.Mesh(geometry, material);
		// scene.add(cube);

		camera.position.z = 20;
		var controls = new THREE.OrbitControls(camera, renderer.domElement);

		var ambient = new THREE.AmbientLight( 0x444444 );
		scene.add( ambient );

		var directionalLight = new THREE.DirectionalLight( 0xffeedd );
		directionalLight.position.set( 0, 0, 1 ).normalize();
		scene.add( directionalLight );


		var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				console.log( Math.round(percentComplete, 2) + '% downloaded' );
				$("#loading #complete").html(Math.round(percentComplete, 2) + '% downloaded'); 
			}
		};
		var onError = function ( xhr ) {
			console.log("ERROR OCCUARED"); 
		};

		THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.setPath( objurl + model_name + '/' );
		mtlLoader.load( model_name+'.mtl', function( materials ) {
			materials.preload();
			console.log(materials); 
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials( materials );
			objLoader.setPath( objurl + model_name + '/' );
			objLoader.load( model_name+'.obj', function ( object ) {
				scene.add( object );
				$("#loading").hide(); 

				var x, y, z, minx, miny, minz, maxx, maxy, maxz;
				minx = miny = minz = Infinity;
				maxx = maxy = maxz = -Infinity;
				x=y=z=0.0;
				var i = 0;

				object.traverse( function ( child ) {

				    if ( child.geometry !== undefined ) {
				    	i ++; 

				    	var cx = new THREE.Vector3();

						child.geometry.computeBoundingBox();
						cx.x = (child.geometry.boundingBox.max.x + child.geometry.boundingBox.min.x) / 2;
					    cx.y = (child.geometry.boundingBox.max.y + child.geometry.boundingBox.min.y) / 2;
					    cx.z = (child.geometry.boundingBox.max.z + child.geometry.boundingBox.min.z) / 2;

						x += cx.x;
						y += cx.y;
						z += cx.z;

						if(minx > cx.x) minx = cx.x;
						if(miny > cx.y) miny = cx.y;
						if(minz > cx.z) minz = cx.z;

						if(maxx < cx.x) maxx = cx.x;
						if(maxy < cx.y) maxy = cx.y;
						if(maxz < cx.z) maxz = cx.z;

				    }

				} );

				x /= i; y /= i; z /= i;
				object.position.x -= x;
				object.position.y -= y;
				object.position.z += -minz - maxz - (maxx-minx + maxy-miny); 

				controls.target.set( x, y, -minz - maxz - (maxx-minx + maxy-miny) );

				console.log(camera);
				old_model = model_name;	
				console.log(scene); 
		
				render();
		
			}, onProgress, onError );
		}, onProgress, onError);

		console.log("HERE"); 

		function render() {
		   	requestAnimationFrame(render);
		   	renderer.render(scene, camera);
		   	cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;
		}

	}

/*
Scripts for settings-panel
*/

	jQuery("#param-settings ul.tab-header > li").click(function() {
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		var content_id = 'tab-body-' + $(this).children('label').first().attr('for'); 
		$("#param-settings div.tab-body > div").hide();
		$("#param-settings #" + content_id).show();
	}); 

	$("#param-settings div.tab-body > div").hide();
	$("#param-settings div.tab-body > div:first-child").show();

	function load_params() {
		var exclude = ['age'];
		$("#param-settings ul.tab-header > li > label").each(function() {
			var name=$(this).attr('for');
			if(exclude.includes(name))
				return ; 
			var container_id='#tab-body-'+name;
			jQuery.ajax({
				type: 'post',
				url: ajax_url.ajax_url,
				data: {
					action: 'settings_scan', 
					sub_dir: name
				},
				success: function(res){
					console.log(res);
					var r = jQuery.parseJSON(res); 
					console.log(r);
					for(var i = 0; i < r.length; i ++) {
						for(var k in r[i]) {
							console.log(k);
							console.log(r[i][k])
							$(container_id).append('<div class="caption">'+k.split('-')[0]+'</div>');
							for(var j = 0; j < r[i][k].length; j ++) {
								console.log(r[i][k][j]);
								$(container_id).append('<label><input style="display:none; " type="radio" name="'+k.split('-')[1]+'" /><img src="'+r[i][k][j]+'" /></label>' ); 
							}
						}
					}
				}
			}); 
		})
	}

}); 


function dragOverstyle(ev) {
	document.getElementById("upload_pane").style.backgroundColor = '#2395ff';
	document.getElementById("upload_pane").style.opacity = 1;
}

function dragLeaveStyle(ev) {
	document.getElementById("upload_pane").style.backgroundColor = 'transparent';
	if(window.flag) document.getElementById("upload_pane").style.opacity = 0;
}