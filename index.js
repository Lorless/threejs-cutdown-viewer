function init() {


    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const ovcamera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -2000, 10000);
    const objects = [];
    const camera = ovcamera;
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


//cube
    let mesh;
    const cube = new THREE.BoxBufferGeometry(100, 100, 100);
    mesh = new THREE.Mesh(cube, new THREE.MeshBasicMaterial({color: 0x0000ff, opacity: 0.5, transparent: true}));
    mesh.position.x = 500;
    mesh.scale.x = mesh.scale.y = mesh.scale.z = 2;
    scene.add(mesh);

// const path = new THREE.Path();
//
// path.lineTo( 0, 0.8 );
// path.quadraticCurveTo( 0, 1, 0.2, 1 );
// path.lineTo( 1, 1 );
//
// const points = path.getPoints();
//
// const geometry = new THREE.BufferGeometry().setFromPoints( points );
// const material = new THREE.LineBasicMaterial( { color: 0xffffff } );
//
// const line = new THREE.Line( geometry, material );
// scene.add( line );

    const loader = new THREE.SVGLoader();
    loader.load('test2.svg', (data) => {

            var paths = data.paths;
            var group = new THREE.Group();

            for ( var i = 0; i < paths.length; i ++ ) {

                var path = paths[ i ];

                var material = new THREE.MeshBasicMaterial( {
                    color: path.color,
                    side: THREE.DoubleSide,
                    depthWrite: false
                } );

                var shapes = path.toShapes( true );

                for ( var j = 0; j < shapes.length; j ++ ) {

                    var shape = shapes[ j ];
                    var geometry = new THREE.ShapeBufferGeometry( shape );
                    var mesh = new THREE.Mesh( geometry, material );
                    group.add( mesh );

                }

            }
            console.log(group);
            scene.add( group );
        }, (progress) => {
            console.log(progress);
        },
        (error) => {
            console.log(error);
        });


// lighting
    const ambient = new THREE.AmbientLight(0x80ffff);
    scene.add(ambient);
    scene.add(camera);

// render
    animate();
    function animate() {
        requestAnimationFrame( animate );
        render();
    }
    function render() {
        renderer.render( scene, camera );
    }
}
