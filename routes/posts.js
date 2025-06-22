const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const BlogPost = require('../models/BlogPost');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Configure multer for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

const upload = multer({ storage: storage });

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single blog post
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'username')
      .populate('comments.postedBy', 'username');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create blog post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, content } = req.body;
    
    const newPost = new BlogPost({
      title,
      subtitle,
      content,
      author: req.user._id,
      imageUrl: req.file ? req.file.path : null
    });

    const post = await newPost.save();
    await post.populate('author', 'username');
    
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to a blog post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const newComment = {
      text: req.body.text,
      postedBy: req.user._id
    };
    
    post.comments.push(newComment);
    
    await post.save();
    
    const populatedPost = await BlogPost.findById(req.params.id)
      .populate('author', 'username')
      .populate('comments.postedBy', 'username');
      
    res.json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a comment from a blog post
router.delete('/:postId/comment/:commentId', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    const populatedPost = await BlogPost.findById(req.params.postId)
      .populate('author', 'username')
      .populate('comments.postedBy', 'username');

    res.json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a comment on a blog post
router.put('/:postId/comment/:commentId', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    comment.text = req.body.text;
    await post.save();

    const populatedPost = await BlogPost.findById(req.params.postId)
      .populate('author', 'username')
      .populate('comments.postedBy', 'username');

    res.json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update blog post
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, content } = req.body;
    
    let post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    } 
    
    const updateFields = {
      title: title || post.title,
      subtitle: subtitle || post.subtitle,
      content: content || post.content
    };
    
    if (req.file) {
      updateFields.imageUrl = req.file.path;
    }
    
    post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate('author', 'username');
    
    const populatedPost = await post.populate([
        { path: 'author', select: 'username' },
        { path: 'comments.postedBy', select: 'username' }
    ]);
    
    res.json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete blog post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await post.deleteOne();
    
    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a post
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id.toString();
    const likeIndex = post.likes.findIndex(id => id.toString() === userId);
    const dislikeIndex = post.dislikes.findIndex(id => id.toString() === userId);

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1); // Unlike
    } else {
      post.likes.push(req.user._id);
      if (dislikeIndex > -1) {
        post.dislikes.splice(dislikeIndex, 1); // Remove from dislikes
      }
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dislike a post
router.put('/:id/dislike', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id.toString();
    const likeIndex = post.likes.findIndex(id => id.toString() === userId);
    const dislikeIndex = post.dislikes.findIndex(id => id.toString() === userId);

    if (dislikeIndex > -1) {
      post.dislikes.splice(dislikeIndex, 1); // Undislike
    } else {
      post.dislikes.push(req.user._id);
      if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1); // Remove from likes
      }
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a comment
router.put('/:postId/comment/:commentId/like', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user._id.toString();
    const likeIndex = comment.likes.findIndex(id => id.toString() === userId);
    const dislikeIndex = comment.dislikes.findIndex(id => id.toString() === userId);

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(req.user._id);
      if (dislikeIndex > -1) {
        comment.dislikes.splice(dislikeIndex, 1);
      }
    }

    await post.save();
    const populatedPost = await BlogPost.findById(req.params.postId)
      .populate('author', 'username')
      .populate('comments.postedBy', 'username');
    res.json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dislike a comment
router.put('/:postId/comment/:commentId/dislike', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user._id.toString();
    const likeIndex = comment.likes.findIndex(id => id.toString() === userId);
    const dislikeIndex = comment.dislikes.findIndex(id => id.toString() === userId);

    if (dislikeIndex > -1) {
      comment.dislikes.splice(dislikeIndex, 1);
    } else {
      comment.dislikes.push(req.user._id);
      if (likeIndex > -1) {
        comment.likes.splice(likeIndex, 1);
      }
    }

    await post.save();
    const populatedPost = await BlogPost.findById(req.params.postId)
      .populate('author', 'username')
      .populate('comments.postedBy', 'username');
    res.json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 