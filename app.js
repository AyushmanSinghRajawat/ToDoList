//jshint esversion:6
import express from "express";
import mongoose from "mongoose";
import _ from "lodash";
mongoose.connect('mongodb+srv://admin-asr:test-123@cluster0.sfy8u8k.mongodb.net/TodolistDB');
const {Schema}=mongoose;
const itemsSchema=new Schema({ name: String});
const Item= mongoose.model('Item', itemsSchema);

const item1= new Item({name:"one item"});
const item2= new Item({name:"two item"});
const item3= new Item({name:"three item"});
const defaultItems=[item1,item2,item3];
const ListSchema=new Schema({
  name:String,
  items: [itemsSchema]
});
const List= mongoose.model('List',ListSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res) {
  Item.find().then((items) => {
    if(items.length==0){
      Item.insertMany(defaultItems);
      res.redirect("/"); 
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }  
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const itemX= new Item({name: itemName});
  if(listName=="Today"){
    itemX.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(itemX);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete", (req,res)=>{
  const checkedItemId=req.body.checkbox;
  const listName= req.body.listName;
  if(listName=="Today"){
      
    Item.findByIdAndRemove(checkedItemId).then(()=>{
      console.log("yoooooo delete");
    })
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}}).then(()=>{
        res.redirect("/"+listName);
      
    });
  }
});

app.get('/:activityName',(req,res)=>{
  const customList = _.capitalize( req.params.activityName);
  List.findOne({name: customList}).then((foundList)=>{
    if(foundList){ 
      res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
    } else {
      const list = new List({
      name:customList,
      items:defaultItems
    });
  
      list.save();
      console.log("saved");
      res.redirect("/"+customList);
    }
    });
 
}); 

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
