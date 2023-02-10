//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const app = express();
const _ = require("lodash")

mongoose.connect("mongodb+srv://Sakosa878:MAMMIEDRIE@cluster0.f0b8trt.mongodb.net/ToDoTwo?retryWrites=true&w=majority", {useNewUrlParser: true})
mongoose.set('strictQuery', true);

const itemsSchema ={
  name: String
}
const Item = mongoose.model(
  "Item",
  itemsSchema
)

const itemOne = new Item({
  name: "Numero Uno"
})
const itemTwo = new Item({
  name: "Numero Twic-eh"
})
const itemThree = new Item({
  name: "itemOne is ready"
})

const defItems = [itemOne, itemTwo, itemThree]

const ListSchema = {
  name: String,
  items: [itemsSchema],
}

const List = mongoose.model("List", ListSchema)

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/", function(req, res) {

  Item.find({}, function(err, docs){
      if(docs.length === 0){
        Item.insertMany(defItems, function(err){
          if(err){
            console.log(err)
          } else {
            console.log("logged def item")
          }
        });
        res.redirect("/");
      } else {
          res.render("list", {listTitle: "Today", newListItems: docs});

      }
  });
})


  

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name:itemName,
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/")
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }
});


app.post("/delete", function(req, res){
  const deleteItem = req.body.checkbox
  const listname = req.body.listName;

    if (listname === "Today") {
      Item.findByIdAndRemove(deleteItem, function(err){
    if (!err) {
      console.log("no error")
      res.redirect("/")
    }
  });
    } else {
      List.findOneAndUpdate({name: listname}, {$pull: {items: {_id: deleteItem}}}, function(err, foundList){
        if(!err){
          res.redirect("/" + listname)
        }
      })
    }

  
})


app.get("/:customListName", function(req, res){
    const customListname = _.capitalize(req.params.customListName)
    console.log(customListname)

    List.findOne({name:customListname}, function(err, foundList){
      if(!err){
        if(!foundList){
           const ListOne = new List({
                name: customListname,
                items: defItems
                
              })
        ListOne.save();
        res.redirect("/" + customListname)
        } else {
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items})

        }
      }
    })


   
    
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
