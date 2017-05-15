/* classes */

// Color constructor
class Color {
    constructor(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0))
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255))
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a;
            }
        } // end try

        catch (e) {
            console.log(e);
        }
    } // end Color constructor

        // Color change method
    change(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0))
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255))
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a;
            }
        } // end throw

        catch (e) {
            console.log(e);
        }
    } // end Color change method
} // end color class


// Vector constructor
// https://evanw.github.io/lightgl.js/docs/vector.html
class Vector {
    constructor(x,y,z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    } // end vector constructor

    change(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    } // end vector change method
} // end vector class

/* utility functions */

// draw a pixel at x,y using color
function drawPixel(imagedata,x,y,color) {
    try {
        if ((typeof(x) !== "number") || (typeof(y) !== "number"))
            throw "drawpixel location not a number";
        else if ((x<0) || (y<0) || (x>=imagedata.width) || (y>=imagedata.height))
            throw "drawpixel location outside of image";
        else if (color instanceof Color) {
            var pixelindex = (y*imagedata.width + x) * 4;
            imagedata.data[pixelindex] = color.r;
            imagedata.data[pixelindex+1] = color.g;
            imagedata.data[pixelindex+2] = color.b;
            imagedata.data[pixelindex+3] = color.a;
        } else
            throw "drawpixel color is not a Color";
    } // end try

    catch(e) {
        console.log(e);
    }
} // end drawPixel

// get the input spheres from the standard class URL
function getInputSpheres() {
    const INPUT_SPHERES_URL =
        "https://ncsucgclass.github.io/prog1/spheres.json";

    // load the spheres file
    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_SPHERES_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input spheres file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response);
} // end get input spheres


// put random points in the spheres from the class github
function drawSpheres_BlinnPhong(context) {
    var inputSpheres = getInputSpheres();
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    var BlackWindow = new Color(0,0,0,255); // init window color

    // Creating a Black colored window
    for (var y = 0; y <= 1; y = y + 1/(h-1)){
        for (var x = 0; x <= 1; x = x + 1/(w-1)){
          drawPixel(imagedata, Math.floor(x*w), Math.floor(y*h), BlackWindow);
        }
      }


    if (inputSpheres != String.null) {
        var cx = 0; var cy = 0; var cz = 0// init center x, y and z coord
        var sphereRadius = 0; // init sphere radius
        var sphereColor = new Color(0,0,0,0); // init the sphere color
        var len = inputSpheres.length; // number of spheres


        var eye = new Vector(0.5, 0.5, -0.5); // Eye location
        var pixel = new Vector(); // Pixel location
        var point = new Vector(); // Point location on sphere
        var light = new Vector(2,4,-0.5); // Light location

        var a = 0; var b = 0; var c = 0; var d = 0;// init a,b,c to solve quadratic equation

        // unit vectors
        var normal_unit_vector = new Vector(); // N
        var light_unit_vector = new Vector(); // L
        var eye_unit_vector = new Vector(); // V
        var h_vector = new Vector(); // H

        // Loop over the spheres, draw pixels in each
        for (var s=0; s<len; s++) {
            cx = inputSpheres[s].x; // sphere center x
            cy = inputSpheres[s].y; // sphere center y
            cz = inputSpheres[s].z; // sphere center z
            sphereRadius = inputSpheres[s].r; // radius
            n = inputSpheres[s].n; // specular constant

            // bilinear interpolation
            for (var y = 0; y <= 1; y = y + 1/(h-1)){
                for (var x = 0; x <= 1; x = x + 1/(w-1)){
                    // traversing the window one pixel at a time
                    pixel.change(x,y,0);


                    a = (pixel.x - eye.x)*(pixel.x - eye.x) + (pixel.y - eye.y)*(pixel.y - eye.y) + (pixel.z - eye.z)*(pixel.z - eye.z);
                    b = 2 * ((pixel.x - eye.x)*(eye.x - cx) + (pixel.y - eye.y)*(eye.y - cy) + (pixel.z - eye.z)*(eye.z - cz));
                    c = ((eye.x - cx)*(eye.x - cx) + (eye.y - cy)*(eye.y - cy) + (eye.z - cz)*(eye.z - cz)) - sphereRadius*sphereRadius;

                    d = (b*b) - (4*a*c);

                    if (d > 0) {

                      // check minimum t for intersection
                      var t = Math.min((-b + Math.sqrt(d))/(2*a), (-b - Math.sqrt(d))/(2*a));
                      //console.log(t);

                      // point co-ordinates on sphere
                      point.change(eye.x + t*(pixel.x - eye.x), eye.y + t*(pixel.y - eye.y), eye.z + t*(pixel.z - eye.z));
                      //console.log(point.x,point.y,point.z);

                      // calculating unit normal vector to the point
                      var mag_point = Math.sqrt((cx - point.x)*(cx - point.x) + (cy - point.y)*(cy - point.y) + (cz - point.z)*(cz - point.z));
                      //console.log(mag_point);

                      normal_unit_vector.change((cx - point.x)/mag_point, (cy - point.y)/mag_point, (cz - point.z)/mag_point);
                      // console.log(normal_unit_vector.x, normal_unit_vector.y, normal_unit_vector.z);
                      // console.log(Math.sqrt(normal_unit_vector.x*normal_unit_vector.x + normal_unit_vector.y*normal_unit_vector.y + normal_unit_vector.z*normal_unit_vector.z));

                      // calculating unit vector from light source to point
                      var mag_light = Math.sqrt((light.x - point.x)*(light.x - point.x) + (light.y - point.y)*(light.y - point.y) + (light.z - point.z)*(light.z - point.z));
                      // console.log(mag_light);

                      light_unit_vector.change(-(light.x - point.x)/mag_light, -(light.y - point.y)/mag_light, -(light.z - point.z)/mag_light);
                      //console.log(light_unit_vector.x,light_unit_vector.y,light_unit_vector.z);
                      // console.log(Math.sqrt(light_unit_vector.x*light_unit_vector.x + light_unit_vector.y*light_unit_vector.y + light_unit_vector.z*light_unit_vector.z));

                      // dot product of N and L
                      var dotNL = normal_unit_vector.x * light_unit_vector.x + normal_unit_vector.y * light_unit_vector.y + normal_unit_vector.z * light_unit_vector.z;

                      if (dotNL < 0)
                      dotNL = 0;
                      //console.log(dotNL);

                      // dot product of N and H
                      var mag_eye = Math.sqrt((point.x - eye.x)*(point.x - eye.x) + (point.y - eye.y)*(point.y - eye.y) + (point.z - eye.z)*(point.z - eye.z));

                      eye_unit_vector.change((point.x - eye.x)/mag_eye, (point.y - eye.y)/mag_eye, (point.z - eye.z)/mag_eye);
                      //console.log(eye_unit_vector.x, eye_unit_vector.y, eye_unit_vector.z);

                      // H vector
                      h_vector.change(eye_unit_vector.x + light_unit_vector.x, eye_unit_vector.y + light_unit_vector.y, eye_unit_vector.z + light_unit_vector.z);
                      var h_mag = Math.sqrt(h_vector.x*h_vector.x + h_vector.y*h_vector.y + h_vector.z*h_vector.z);

                      h_vector.change(h_vector.x/h_mag, h_vector.y/h_mag, h_vector.z/h_mag);
                      //console.log(h_vector.x,h_vector.y,h_vector.z);

                      dotNH = normal_unit_vector.x * h_vector.x + normal_unit_vector.y * h_vector.y + normal_unit_vector.z * h_vector.z;
                      if (dotNH < 0)
                      dotNH = 0;
                      dotNH = Math.pow(dotNH,n);

                      color_r = (inputSpheres[s].ambient[0]) + (dotNL*inputSpheres[s].diffuse[0]) + (dotNH*inputSpheres[s].specular[0]);
                      if (color_r > 1)
                      color_r = 1;
                      if (color_r < 0)
                      color_r = 0;

                      color_g = (inputSpheres[s].ambient[1]) + (dotNL*inputSpheres[s].diffuse[1]) + (dotNH*inputSpheres[s].specular[1]);
                      if (color_g > 1)
                      color_g = 1;
                      if (color_g < 0)
                      color_g = 0;

                      color_b = (inputSpheres[s].ambient[2]) + (dotNL*inputSpheres[s].diffuse[2]) + (dotNH*inputSpheres[s].specular[2]);
                      if (color_g > 1)
                      color_g = 1;
                      if (color_g < 0)
                      color_g = 0;

                      //console.log(color_r,color_g,color_b);


                      sphereColor.change(color_r*255, color_g*255, color_b*255, 255); // sphere color

                          drawPixel(imagedata, Math.floor(x*w), Math.floor((1-y)*h), sphereColor);
                  }//end if intersection found
                } //end for pixels in row
            } //end for pixels in column
          } // end for pixels in sphere

        context.putImageData(imagedata, 0, 0);
      } // end if spheres found
    } // end draw spheres Blinn Phong


    function drawSpheres_BlinnPhong_noshadows(context) {
        var inputSpheres = getInputSpheres();
        var w = context.canvas.width;
        var h = context.canvas.height;
        var imagedata = context.createImageData(w,h);
        var BlackWindow = new Color(0,0,0,255); // init window color

        // Creating a Black colored window
        for (var y = 0; y <= 1; y = y + 1/(h-1)){
            for (var x = 0; x <= 1; x = x + 1/(w-1)){
              drawPixel(imagedata, Math.floor(x*w), Math.floor(y*h), BlackWindow);
            }
          }


        if (inputSpheres != String.null) {
            var cx = 0; var cy = 0; var cz = 0// init center x, y and z coord
            var sphereRadius = 0; // init sphere radius
            var sphereColor = new Color(0,0,0,0); // init the sphere color
            var len = inputSpheres.length; // number of spheres


            var eye = new Vector(0.5, 0.5, -0.5); // Eye location
            var pixel = new Vector(); // Pixel location
            var point = new Vector(); // Point location on sphere
            var light = new Vector(document.getElementById("x").value,document.getElementById("y").value,document.getElementById("z").value); // Light location

            var a = 0; var b = 0; var c = 0; var d = 0;// init a,b,c to solve quadratic equation

            // unit vectors
            var normal_unit_vector = new Vector(); // N
            var light_unit_vector = new Vector(); // L
            var eye_unit_vector = new Vector(); // V
            var h_vector = new Vector(); // H

            // Loop over the spheres, draw pixels in each
            for (var s=0; s<len; s++) {
                cx = inputSpheres[s].x; // sphere center x
                cy = inputSpheres[s].y; // sphere center y
                cz = inputSpheres[s].z; // sphere center z
                sphereRadius = inputSpheres[s].r; // radius
                n = inputSpheres[s].n; // specular constant

                // bilinear interpolation
                for (var y = 0; y <= 1; y = y + 1/(h-1)){
                    for (var x = 0; x <= 1; x = x + 1/(w-1)){
                        // traversing the window one pixel at a time
                        pixel.change(x,y,0);


                        a = (pixel.x - eye.x)*(pixel.x - eye.x) + (pixel.y - eye.y)*(pixel.y - eye.y) + (pixel.z - eye.z)*(pixel.z - eye.z);
                        b = 2 * ((pixel.x - eye.x)*(eye.x - cx) + (pixel.y - eye.y)*(eye.y - cy) + (pixel.z - eye.z)*(eye.z - cz));
                        c = ((eye.x - cx)*(eye.x - cx) + (eye.y - cy)*(eye.y - cy) + (eye.z - cz)*(eye.z - cz)) - sphereRadius*sphereRadius;

                        d = (b*b) - (4*a*c);

                        if (d > 0) {

                          // check minimum t for intersection
                          var t = Math.min((-b + Math.sqrt(d))/(2*a), (-b - Math.sqrt(d))/(2*a));
                          //console.log(t);

                          // point co-ordinates on sphere
                          point.change(eye.x + t*(pixel.x - eye.x), eye.y + t*(pixel.y - eye.y), eye.z + t*(pixel.z - eye.z));
                          //console.log(point.x,point.y,point.z);

                          // calculating unit normal vector to the point
                          var mag_point = Math.sqrt((cx - point.x)*(cx - point.x) + (cy - point.y)*(cy - point.y) + (cz - point.z)*(cz - point.z));
                          //console.log(mag_point);

                          normal_unit_vector.change((cx - point.x)/mag_point, (cy - point.y)/mag_point, (cz - point.z)/mag_point);
                          // console.log(normal_unit_vector.x, normal_unit_vector.y, normal_unit_vector.z);
                          // console.log(Math.sqrt(normal_unit_vector.x*normal_unit_vector.x + normal_unit_vector.y*normal_unit_vector.y + normal_unit_vector.z*normal_unit_vector.z));

                          // calculating unit vector from light source to point
                          var mag_light = Math.sqrt((light.x - point.x)*(light.x - point.x) + (light.y - point.y)*(light.y - point.y) + (light.z - point.z)*(light.z - point.z));
                          // console.log(mag_light);

                          light_unit_vector.change(-(light.x - point.x)/mag_light, -(light.y - point.y)/mag_light, -(light.z - point.z)/mag_light);
                          //console.log(light_unit_vector.x,light_unit_vector.y,light_unit_vector.z);
                          // console.log(Math.sqrt(light_unit_vector.x*light_unit_vector.x + light_unit_vector.y*light_unit_vector.y + light_unit_vector.z*light_unit_vector.z));

                          // dot product of N and L
                          var dotNL = normal_unit_vector.x * light_unit_vector.x + normal_unit_vector.y * light_unit_vector.y + normal_unit_vector.z * light_unit_vector.z;

                          if (dotNL < 0)
                          dotNL = 0;
                          //console.log(dotNL);

                          // dot product of N and H
                          var mag_eye = Math.sqrt((point.x - eye.x)*(point.x - eye.x) + (point.y - eye.y)*(point.y - eye.y) + (point.z - eye.z)*(point.z - eye.z));

                          eye_unit_vector.change((point.x - eye.x)/mag_eye, (point.y - eye.y)/mag_eye, (point.z - eye.z)/mag_eye);
                          //console.log(eye_unit_vector.x, eye_unit_vector.y, eye_unit_vector.z);

                          // H vector
                          h_vector.change(eye_unit_vector.x + light_unit_vector.x, eye_unit_vector.y + light_unit_vector.y, eye_unit_vector.z + light_unit_vector.z);
                          var h_mag = Math.sqrt(h_vector.x*h_vector.x + h_vector.y*h_vector.y + h_vector.z*h_vector.z);

                          h_vector.change(h_vector.x/h_mag, h_vector.y/h_mag, h_vector.z/h_mag);
                          //console.log(h_vector.x,h_vector.y,h_vector.z);

                          dotNH = normal_unit_vector.x * h_vector.x + normal_unit_vector.y * h_vector.y + normal_unit_vector.z * h_vector.z;
                          if (dotNH < 0)
                          dotNH = 0;
                          dotNH = Math.pow(dotNH,15);

                          color_r = (inputSpheres[s].ambient[0]) + (dotNL*inputSpheres[s].diffuse[0]) + (dotNH*inputSpheres[s].specular[0]);
                          if (color_r > 1)
                          color_r = 1;
                          if (color_r < 0)
                          color_r = 0;

                          color_g = (inputSpheres[s].ambient[1]) + (dotNL*inputSpheres[s].diffuse[1]) + (dotNH*inputSpheres[s].specular[1]);
                          if (color_g > 1)
                          color_g = 1;
                          if (color_g < 0)
                          color_g = 0;

                          color_b = (inputSpheres[s].ambient[2]) + (dotNL*inputSpheres[s].diffuse[2]) + (dotNH*inputSpheres[s].specular[2]);
                          if (color_g > 1)
                          color_g = 1;
                          if (color_g < 0)
                          color_g = 0;

                          //console.log(color_r,color_g,color_b);


                          sphereColor.change(color_r*255, color_g*255, color_b*255, 255); // sphere color

                              drawPixel(imagedata, Math.floor(x*w), Math.floor((1-y)*h), sphereColor);
                      }//end if intersection found
                    } //end for pixels in row
                } //end for pixels in column
              } // end for pixels in sphere

            context.putImageData(imagedata, 0, 0);
          } // end if spheres found
        } // end draw spheres Blinn Phong

    function drawSpheres_BlinnPhong_shadows(context) {
        var inputSpheres = getInputSpheres();
        var w = context.canvas.width;
        var h = context.canvas.height;
        var imagedata = context.createImageData(w,h);
        var BlackWindow = new Color(0,0,0,255); // init window color

        // Creating a Black colored window
        for (var y = 0; y <= 1; y = y + 1/(h-1)){
            for (var x = 0; x <= 1; x = x + 1/(w-1)){
              drawPixel(imagedata, Math.floor(x*w), Math.floor(y*h), BlackWindow);
            }
          }


        if (inputSpheres != String.null) {
            var cx = 0; var cy = 0; var cz = 0// init center x, y and z coord
            var sphereRadius = 0; // init sphere radius
            var sphereColor = new Color(0,0,0,0); // init the sphere color
            var len = inputSpheres.length; // number of spheres


            var eye = new Vector(0.5, 0.5, -0.5); // Eye location
            var pixel = new Vector(); // Pixel location
            var point = new Vector(); // Point location on sphere
            //var light = new Vector(2,2,-0.5); // Light location
            var light = new Vector(document.getElementById("x").value,document.getElementById("y").value,document.getElementById("z").value); // Light location

            var a = 0; var b = 0; var c = 0; var d = 0;// init a,b,c to solve quadratic equation

            // unit vectors
            var normal_unit_vector = new Vector(); // N
            var light_unit_vector = new Vector(); // L
            var eye_unit_vector = new Vector(); // V
            var h_vector = new Vector(); // H

            // Loop over the spheres, draw pixels in each
            for (var s=0; s<len; s++) {
                cx = inputSpheres[s].x; // sphere center x
                cy = inputSpheres[s].y; // sphere center y
                cz = inputSpheres[s].z; // sphere center z
                sphereRadius = inputSpheres[s].r; // radius
                n = inputSpheres[s].n; // specular constant

                // bilinear interpolation
                for (var y = 0; y <= 1; y = y + 1/(h-1)){
                    for (var x = 0; x <= 1; x = x + 1/(w-1)){
                        // traversing the window one pixel at a time
                        pixel.change(x,y,0);


                        a = (pixel.x - eye.x)*(pixel.x - eye.x) + (pixel.y - eye.y)*(pixel.y - eye.y) + (pixel.z - eye.z)*(pixel.z - eye.z);
                        b = 2 * ((pixel.x - eye.x)*(eye.x - cx) + (pixel.y - eye.y)*(eye.y - cy) + (pixel.z - eye.z)*(eye.z - cz));
                        c = ((eye.x - cx)*(eye.x - cx) + (eye.y - cy)*(eye.y - cy) + (eye.z - cz)*(eye.z - cz)) - sphereRadius*sphereRadius;

                        d = (b*b) - (4*a*c);

                        if (d > 0) {

                          // check minimum t for intersection
                          var t = Math.min((-b + Math.sqrt(d))/(2*a), (-b - Math.sqrt(d))/(2*a));
                          //console.log(t);

                          // point co-ordinates on sphere
                          point.change(eye.x + t*(pixel.x - eye.x), eye.y + t*(pixel.y - eye.y), eye.z + t*(pixel.z - eye.z));
                          //console.log(point.x,point.y,point.z);

                          //start here

                          for (var i=0; i<len; i++) {
                              var cx1 = inputSpheres[i].x; // sphere center x
                              var cy1 = inputSpheres[i].y; // sphere center y
                              var cz1 = inputSpheres[i].z; // sphere center z
                              var sphereRadius1 = inputSpheres[i].r; // radius


                          var a1 = (point.x - light.x)*(point.x - light.x) + (point.y - light.y)*(point.y - light.y) + (point.z - light.z)*(point.z - light.z);
                          var b1 = 2 * ((point.x - light.x)*(light.x - cx1) + (point.y - light.y)*(light.y - cy1) + (point.z - light.z)*(light.z - cz1));
                          var c1 = ((light.x - cx1)*(light.x - cx1) + (light.y - cy1)*(light.y - cy1) + (light.z - cz1)*(light.z - cz1)) - sphereRadius1*sphereRadius1;

                          var d1 = (b1*b1) - (4*a1*c1);


                          if (d1 > 0){

                          var t1 = (-b1 + Math.sqrt(d1))/(2*a1);
                          var t2 = (-b1 - Math.sqrt(d1))/(2*a1);

                          if (t1 < 1 && t2 < 1)
                          S = 0;
                          else
                          S = 1;

                        }

                          //end here

                          // calculating unit normal vector to the point
                          var mag_point = Math.sqrt((cx - point.x)*(cx - point.x) + (cy - point.y)*(cy - point.y) + (cz - point.z)*(cz - point.z));
                          //console.log(mag_point);

                          normal_unit_vector.change((cx - point.x)/mag_point, (cy - point.y)/mag_point, (cz - point.z)/mag_point);
                          // console.log(normal_unit_vector.x, normal_unit_vector.y, normal_unit_vector.z);
                          // console.log(Math.sqrt(normal_unit_vector.x*normal_unit_vector.x + normal_unit_vector.y*normal_unit_vector.y + normal_unit_vector.z*normal_unit_vector.z));

                          // calculating unit vector from light source to point
                          var mag_light = Math.sqrt((light.x - point.x)*(light.x - point.x) + (light.y - point.y)*(light.y - point.y) + (light.z - point.z)*(light.z - point.z));
                          // console.log(mag_light);

                          light_unit_vector.change(-(light.x - point.x)/mag_light, -(light.y - point.y)/mag_light, -(light.z - point.z)/mag_light);
                          //console.log(light_unit_vector.x,light_unit_vector.y,light_unit_vector.z);
                          // console.log(Math.sqrt(light_unit_vector.x*light_unit_vector.x + light_unit_vector.y*light_unit_vector.y + light_unit_vector.z*light_unit_vector.z));

                          // dot product of N and L
                          var dotNL = normal_unit_vector.x * light_unit_vector.x + normal_unit_vector.y * light_unit_vector.y + normal_unit_vector.z * light_unit_vector.z;

                          if (dotNL < 0)
                          dotNL = 0;
                          //console.log(dotNL);

                          // dot product of N and H
                          var mag_eye = Math.sqrt((point.x - eye.x)*(point.x - eye.x) + (point.y - eye.y)*(point.y - eye.y) + (point.z - eye.z)*(point.z - eye.z));

                          eye_unit_vector.change((point.x - eye.x)/mag_eye, (point.y - eye.y)/mag_eye, (point.z - eye.z)/mag_eye);
                          //console.log(eye_unit_vector.x, eye_unit_vector.y, eye_unit_vector.z);

                          // H vector
                          h_vector.change(eye_unit_vector.x + light_unit_vector.x, eye_unit_vector.y + light_unit_vector.y, eye_unit_vector.z + light_unit_vector.z);
                          var h_mag = Math.sqrt(h_vector.x*h_vector.x + h_vector.y*h_vector.y + h_vector.z*h_vector.z);

                          h_vector.change(h_vector.x/h_mag, h_vector.y/h_mag, h_vector.z/h_mag);
                          //console.log(h_vector.x,h_vector.y,h_vector.z);

                          dotNH = normal_unit_vector.x * h_vector.x + normal_unit_vector.y * h_vector.y + normal_unit_vector.z * h_vector.z;
                          if (dotNH < 0)
                          dotNH = 0;
                          dotNH = Math.pow(dotNH,15);

                          color_r = (inputSpheres[s].ambient[0]) + S*((dotNL*inputSpheres[s].diffuse[0]) + (dotNH*inputSpheres[s].specular[0]));
                          if (color_r > 1)
                          color_r = 1;
                          if (color_r < 0)
                          color_r = 0;

                          color_g = (inputSpheres[s].ambient[1]) + S*((dotNL*inputSpheres[s].diffuse[1]) + (dotNH*inputSpheres[s].specular[1]));
                          if (color_g > 1)
                          color_g = 1;
                          if (color_g < 0)
                          color_g = 0;

                          color_b = (inputSpheres[s].ambient[2]) + S*((dotNL*inputSpheres[s].diffuse[2]) + (dotNH*inputSpheres[s].specular[2]));
                          if (color_g > 1)
                          color_g = 1;
                          if (color_g < 0)
                          color_g = 0;

                          //console.log(color_r,color_g,color_b);


                          sphereColor.change(color_r*255, color_g*255, color_b*255, 255); // sphere color

                              drawPixel(imagedata, Math.floor(x*w), Math.floor((1-y)*h), sphereColor);
                            } //end if light point intersection
                      }//end if intersection found
                    } //end for pixels in row
                } //end for pixels in column
              } // end for pixels in sphere

            context.putImageData(imagedata, 0, 0);
          } // end if spheres found
        } // end draw spheres Blinn Phong


  /* main -- here is where execution begins after window load */

  function main() {

      // Get the canvas and context
      var canvas = document.getElementById("viewport");
      canvas.width = 512;
      canvas.height = 512;
      var context = canvas.getContext("2d");

      context.clearRect(0, 0, canvas.width, canvas.height);
      drawSpheres_BlinnPhong(context);
      // shows how to draw pixels and read input file

    }

  function NewCanvas() {

      var canvas = document.getElementById("viewport");
      canvas.width = document.getElementById("w").value;
      canvas.height = document.getElementById("h").value;

      var context = canvas.getContext("2d");

      //var w = document.getElementById("w").value;
      //var h = document.getElementById("h").value;

      context.clearRect(0, 0, canvas.width, canvas.height);
      drawSpheres_BlinnPhong(context);
      // shows how to draw pixels and read input file

  }



  function shadows() {

      // Get the canvas and context
      var canvas = document.getElementById("viewport");
      canvas.width = 512;
      //console.log(canvas.width);
      canvas.height = 512;
      var context = canvas.getContext("2d");

      context.clearRect(0, 0, canvas.width, canvas.height);
      drawSpheres_BlinnPhong_shadows(context);
      // shows how to draw pixels and read input file
    }

    function no_shadows() {

        // Get the canvas and context
        var canvas = document.getElementById("viewport");
        canvas.width = 512;
        //console.log(canvas.width);
        canvas.height = 512;
        var context = canvas.getContext("2d");

        context.clearRect(0, 0, canvas.width, canvas.height);
        drawSpheres_BlinnPhong_noshadows(context);
        // shows how to draw pixels and read input file
      }
