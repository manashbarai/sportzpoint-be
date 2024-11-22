import { Router } from "express";
import { createArticleController, getAllTagController, getAllCategoryController, searchTagByNameController, searchCategoryByNameController, updateArticleController, publishArticleController, getArticlesByCategorySlug, getArticleByIdController, getArticlesByTagSlug, getLatestArticles } from "../controllers/article.controller.js";


const router = Router();
router.route("/tag/").get(getAllTagController)
router.route("/category/").get(getAllCategoryController)
router.route("/tag/search").get(searchTagByNameController)
router.route("/category/search").get(searchCategoryByNameController)

router.route("/article/create").post(createArticleController)
router.route("/article/update").put(updateArticleController)
router.route("/article/publish").get(publishArticleController)
router.get("/article/latest-articles", getLatestArticles);
router.get("/articles/category/:slug", getArticlesByCategorySlug);
router.get("/articles/tags/:slug", getArticlesByTagSlug);
router.get("/article/:id", getArticleByIdController);



// published posts



export default router;
