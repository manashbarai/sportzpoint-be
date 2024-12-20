import { Article } from "../model/articel.model.js";
import { LiveBlogUpdate } from "../model/ liveBlogUpdate.model.js";
import { broadcast } from "../../index.js";

export const addLiveBlogUpdate = async (req, res) => {
  try {
    const { postId } = req.params;
    const requestedData = req.body;

    const article = await Article.findById(postId);

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    if (article.type !== "LiveBlog") {
      return res
        .status(400)
        .json({ success: false, message: "Article is not a LiveBlog type" });
    }

    // if (article.status !== "published") {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Article must be published to add updates" });
    // }

    const update = await LiveBlogUpdate.create({
      post: postId,
      ...requestedData,
    });

    article.live_blog_updates.push(update._id);
    await article.save();

    // Broadcast the update to all clients
    broadcast({ type: "ADD_LIVEBLOG_UPDATE", data: update });


    res.status(201).json({ success: true, update });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const editLiveBlogUpdate = async (req, res) => {
    try {
      const { updateId } = req.params;
      const requestedData = req.body;
  
      const update = await LiveBlogUpdate.findByIdAndUpdate(
        updateId,
        { ...requestedData, updated_at: new Date() },
        { new: true }
      );
  
      if (!update) {
        return res.status(404).json({ success: false, message: "Update not found" });
      }
      // Broadcast the update to all clients
      broadcast({ type: "EDIT_LIVEBLOG_UPDATE", data: update });

      res.status(200).json({ success: true, update });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

  
  export const deleteLiveBlogUpdate = async (req, res) => {
    try {
      const { updateId } = req.params;
  
      const update = await LiveBlogUpdate.findByIdAndDelete(updateId);
  
      if (!update) {
        return res.status(404).json({ success: false, message: "Update not found" });
      }
  
      // Remove the reference from the Article model
      await Article.findByIdAndUpdate(update.article, {
        $pull: { live_blog_updates: updateId },
      });
      // Broadcast the delete event to all clients
      broadcast({ type: "DELETE_LIVEBLOG_UPDATE", data: { updateId } });

      res.status(200).json({ success: true, message: "Update deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

  export const pinLiveBlogUpdate = async (req, res) => {
    try {
      const { updateId } = req.params;
  
      const update = await LiveBlogUpdate.findByIdAndUpdate(
        updateId,
        { pinned: true },
        { new: true }
      );
  
      if (!update) {
        return res.status(404).json({ success: false, message: "Update not found" });
      }
        // Broadcast the pin event to all clients
        broadcast({ type: "PIN_LIVEBLOG_UPDATE", data: update });


  
      res.status(200).json({ success: true, update });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  

  export const getLiveBlogUpdates = async (req, res) => {
    try {
      const { postId } = req.params;
  
      const article = await Article.findById(postId)
        .populate({
          path: "live_blog_updates",
          options: { sort: { createdAt: -1 } }, // Sort by 'createdAt' descending
        })
        .exec();
  
      if (!article) {
        return res.status(404).json({ success: false, message: "Article not found" });
      }
  
      if (article.type !== "LiveBlog") {
        return res.status(400).json({ success: false, message: "Not a LiveBlog article" });
      }
  
      // Return only live_blog_updates data
      res.status(200).json({ updates: article.live_blog_updates });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  

  
  export const getLiveBlogsController = async (req, res) => {
    try {
      // Find articles where `isLive` is true and `status` is "live"
      const liveBlogs = await Article.find({ isLive: true})
        .select("title slug updated_at_datetime isLive status") // Select only necessary fields
        .populate("primary_category categories tags live_blog_updates") // Populate referenced fields if needed
        .sort({ updated_at_datetime: -1 }); // Sort by latest update, adjust if necessary
  
      // Check if any live blogs are found
      if (liveBlogs.length === 0) {
        return res.status(404).json({ message: "No ongoing live blogs found" });
      }
  
      // Return the list of ongoing live blogs
      res.status(200).json({ message: "Ongoing live blogs fetched successfully", liveBlogs });
    } catch (error) {
      console.error("Error fetching live blogs:", error);
      res.status(500).json({ message: "An error occurred while fetching live blogs", error: error.message });
    }
  };