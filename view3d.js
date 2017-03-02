(function($) {
	// alert("3dview loaded"); 
	$(document).ready(function() {

		function Load_Model() {
			var container = $("#model-preview");
			var scene = new THREE.Scene();
			var camera = new THREE.PerspectiveCamera(75,container.width()/container.height(), 1,10000);
			var renderer = new THREE.WebGLRenderer();
			renderer.setSize(container.width(), container.height());
			container.append("HERE"); 
			container.append(renderer.domElement);
			container.append("GOES!"); 
			alert("HERE"); 
			var geometry = new THREE.BoxGeometry(70, 70, 70, 10, 10, 10);
			var material = new THREE.MeshBasicMaterial({color: 0xfffff, wireframe: true});
			var cube = new THREE.Mesh(geometry, material);
			scene.add(cube);
			camera.position.z = 70;
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
				}
			};
			var onError = function ( xhr ) { };

			// THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

			var mtlLoader = new THREE.MTLLoader();
			mtlLoader.setPath( objurl + '/obj/3d_OBJ/' );
			mtlLoader.load( 'Liam.mtl', function( materials ) {
				materials.preload();
				var objLoader = new THREE.OBJLoader();
				objLoader.setMaterials( materials );
				objLoader.setPath( objurl + '/obj/3d_OBJ/' );
				objLoader.load( 'Liam.obj', function ( object ) {
					object.position.y = - 115;
					scene.add( object );
					console.log(object)
				}, onProgress, onError );
			});


			function render() {
			   	requestAnimationFrame(render);
			   	renderer.render(scene, camera);
			   	cube.rotation.x += 0.01;
				cube.rotation.y += 0.01;
			}

			render();
		}
	}); 
}(jQuery)); 