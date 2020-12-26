const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/piece');
//mongoose.Promise = global.Promsie;
mongoose.connection.once('open',function(){

    console.log('success');

}).on('error',function(error){
    console.log(error);
});
console.log('oooiiii');

const PieceSchema = new Schema ({
    name:{
        type: String
    },
    x:{
        type: Number
    },
    y:{
        type: Number
    },
    colour:{
        type: String
    },
    options:{
        type: Array
    }
})

const Piece = mongoose.model('piece',PieceSchema);

var names = ['rookL','horseL','bishopL','king','queen','rookR','horseR','bishopR',
            'pawn0','pawn1','pawn2','pawn3','pawn4','pawn5','pawn6','pawn7',
            'pawn0','pawn1','pawn2','pawn3','pawn4','pawn5','pawn6','pawn7',
            'rookL','horseL','bishopL','king','queen','rookR','horseR','bishopR']

var axises =   [[7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7],
                [6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6],[6,7],
                [1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],
                [0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7]
                ]
var colours = "black"; 
for (var i=0; i < names.length; i++){
    if (i>= names.length/2){
        colours = "white"
    }
    // Piece.create({
    //     name:names[i],
    //     x:axises[i][0],
    //     y:axises[i][1],
    //     "colour": colours,
    //     "options":[]
    //     });
    // add.save(function (err,data){
    //     if (err) return console.error(err);
    //     console.log(data+"saved");
    // });
}
Piece.findOne({name: "rookR"}, function(err,obj) {console.log(obj)})
module.exports = Piece;