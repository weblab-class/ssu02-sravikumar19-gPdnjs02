/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Goals = require("./models/goals");
const Story = require("./models/story");
const Comment = require("./models/comment");
const Message = require("./models/message");
const Icons = require("./models/icons");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");


router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

router.get("/user", (req, res) => {
  User.findById(req.query.userId).then((user) => {
    res.send(user);
  })
  .catch((error) => console.error(error));
});

router.post("/bio", auth.ensureLoggedIn, (req, res) => {
  console.log(`Received a bio from ${req.user.name}: ${req.body.value}`);
  console.log("BIO REQUEST", req.user._id)
  User.findById(req.user._id).then((user) => {
    user.bio = req.body.value; 
    // updating bio here, value called in post call in bio file
    user.save();
  });
})


router.post("/interests", auth.ensureLoggedIn, (req, res) => {
  console.log(`Received interests from ${req.user.name}: ${req.body.value}`);
  User.findById(req.user._id).then((user) => {
    user.interests = req.body.value;
    user.save();
  })
})

router.post("/image", auth.ensureLoggedIn, (req, res) => {
  console.log(`Received interests from ${req.user.name}`);
  User.findById(req.user._id).then((user) => {
    user.image = req.body.value;
    user.save();
  })
})


router.post("/goal", auth.ensureLoggedIn, (req, res) => {

  const newGoal = new Goals({
    creatorId: req.body.creatorId,
    goalId: req.body.goalId,
    goalContent: req.body.content,
    goalTags: req.body.tags,
    frequency: req.body.frequency,
    minimum: req.body.minimum,
    achievement: req.body.achievement,
  });
  {/* newgoal in GoalInput */}

  console.log(req.body);
  newGoal.save().then((goal) => res.send(goal));
});

router.post("/editGoal", (req, res) => {
  Goals.findOne({creatorId: req.body.creatorId, goalId: req.body.goalId}).then((goal) => {
    goal.goalContent = req.body.content,
    goal.frequency = req.body.frequency,
    goal.goalTags = req.body.tags,
    goal.minimum = req.body.minimum,
    goal.save().then(() => {
      res.send({})
    })
  })
})

router.get("/goals", (req, res) => {
  //Get mongoSchema from Stella, put file in models
  Goals.find({creatorId: req.query.creatorId}).then((goals) => {
    res.send(goals);
  });
});

router.get("/goalId", (req, res) => {
  //Get mongoSchema from Stella, put file in models
  Goals.find({creatorId: req.query.creatorId, goalId: req.query.goalId}).then((goals) => {
    res.send(goals);
  });
});

router.post("/updateachievement", (req, res) => {
  console.log("BODY", req.body);
  Goals.updateOne( {creatorId: req.body.creatorId, goalId: req.body.goalId}, {achievement:req.body.achievement}
);});

router.post("/story", auth.ensureLoggedIn, (req, res) => {
  const newStory = new Story({
    creatorId: req.user._id,
    creatorName: req.user.name,
    creatorImage: req.user.image,
    storyTitle: req.body.title,
    storyImage: req.body.image,
    storyContent: req.body.content,
    storyLocation: req.body.location,
    storyTags: req.body.tags,
  });
  newStory.save().then((story) => res.send(story));
});

router.get("/stories", (req, res) => {
//   // empty selector means get all documents
    Story.find({}).then((stories) => res.send(stories));
});

router.get("/myStories", (req, res) => {
  //Get mongoSchema from Stella, put file in models
  Story.find({creatorId: req.query.creatorId}).then((stories) => {
    res.send(stories);
  });
});

router.get("/comment", (req, res) => {
  Comment.find({ parent: req.query.parent }).then((comments) => {
    res.send(comments);
  });
});

router.post("/comment", auth.ensureLoggedIn, (req, res) => {
  const newComment = new Comment({
    creator_id: req.user._id,
    creator_name: req.user.name,
    parent: req.body.parent,
    content: req.body.content,
  });

  newComment.save().then((comment) => res.send(comment));
});


router.post("/following", auth.ensureLoggedIn, (req, res) => {
  console.log("APIFOLLOWING", req.body.following);
  User.findById(req.user._id).then((user) => {
    user.following = req.body.following;
    user.save();
  });
})


// router.post("/followers", auth.ensureLoggedIn, (req, res) => {
//   User.findById({_id: req.body.userId}).then((user) => {
//     user.followers = req.body.followers;
//     user.save();
//   });
// })

router.post("/friends", auth.ensureLoggedIn, (req, res) => {
  console.log("API FRIENDS")
  console.log("type", req.body.userId)
  User.findById(req.user._id).then((user) => {
    console.log("user", user)
    user.friends = req.body.friends;
    user.update();

  });
})


router.get("/chat", (req, res) => {
  let query;
  if (req.query.recipient_id === "ALL_CHAT") {
    // get any message sent by anybody to ALL_CHAT
    query = { "recipient._id": "ALL_CHAT" };
  } else {
    // get messages that are from me->you OR you->me
    query = {
      $or: [
        { "sender._id": req.user._id, "recipient._id": req.query.recipient_id },
        { "sender._id": req.query.recipient_id, "recipient._id": req.user._id },
      ],
    };
  }
  console.log("API CALL ALL CHAT", Message)
  Message.find(query).then((messages) => res.send(messages));
});

router.post("/message", auth.ensureLoggedIn, (req, res) => {
  console.log("HELLO")
  console.log(`Received a chat message from ${req.user.name}: ${req.body.content}`);

  // insert this message into the database
  const message = new Message({
    recipient: req.body.recipient,
    sender: {
      _id: req.user._id,
      name: req.user.name,
    },
    content: req.body.content,
  });
  message.save();

  if (req.body.recipient._id == "ALL_CHAT") {
    socketManager.getIo().emit("message", message);
  } else {
    socketManager.getSocketFromUserID(req.user._id).emit("message", message);
    if (req.user._id !== req.body.recipient._id) {
      socketManager.getSocketFromUserID(req.body.recipient._id).emit("message", message);
    }
  }
});

router.post("/icons", (req, res) => {
  const newIcon = {
    creatorId: req.body.creatorId,
    type: req.body.type,
    state: req.body.state,
  }
  console.log(req.body);
  //newIcon.save().then((icon) => res.send(icon));
  Icons.updateOne({creatorId: req.body.creatorId, type: req.body.type},
    newIcon, {"upsert": true, "useFindAndModify":false}).then(replacedDocument => {
    if(replacedDocument) {
      console.log(`Successfully replaced the following document: ${replacedDocument}.`)
    } else {
      console.log("No document matches the provided query.")
    }
  });
  /*Icons.findOne( {creatorId: req.body.creatorId, type: req.body.type}).then((icon) => {
    icon.state = req.body.state  ;
    icon.save();
  });*/
  //newIcon.save().then((icons) => res.send(icons));
 });

 router.post("/restartachievement", (req, res) => {
  console.log("BODY", req.body);
  Goals.updateMany( {creatorId: req.query.creatorId}, {achievement:0});
 });
 
 
 router.post("/updatestate", (req, res) => {
  console.log("BODY", req.body);
  Icons.findOne( {creatorId: req.body.creatorId, type: req.body.type}).then((icon) => {
      icon.state = req.body.state ;
      icon.save();
  });
 });
 

router.get("/activeUsers", (req, res) => {
  res.send({ activeUsers: socketManager.getAllConnectedUsers() });
});

router.get("/icons", (req, res) => {
  Icons.find({creatorId: req.query.creatorId}).then((icons) => {
    res.send(icons);
  });
 });
 

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;

