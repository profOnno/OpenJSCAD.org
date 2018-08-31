include("lib/text3D.jscad");

function main() {
  //console.log(Font3D);
  
  // f.load returns a promise for 
  // the rest of this function everything is async
  res = Font3D.load("examples/fonts/" + params.font) .then((font) => {
      return new Promise((resolve, reject) => { 
        let res;
        let cags = Font3D.cagFromString(font, params.myText, params.fontSize);

        res = cags.map(
          (c) => linear_extrude({ height: 5 },c)
        );

        res = res[0].union(res);

        res = res.rotateX(90);
//        res = res.center([true,true,false]); 
        res = res.center(); 
        res = res.translate([0,0,-res.getBounds()[0]._z]);
        // center doesn't seem to work well???
        //res = res.center([true,true,false]);
        res = color("lime",res);
        resolve(res);
      })
    })
  
  // must return a Promise once you start async
  return res;
}


function getParameterDefinitions() {
    return [
        { name: 'fontSize', type: 'int', initial: 20, caption: 'Font Size' }, 
        { name: 'myText', type: 'text', initial: "#Awesome", caption: 'Text to show'} ,
        { name: 'font', type: 'text', initial: "Purisa.ttf", caption: 'Purisa.ttf, Courier_New.ttf, Ubuntu-C.ttf or Passengers_Script.ttf' },
    ];
}

