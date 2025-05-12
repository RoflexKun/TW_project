<?php
    require_once(__DIR__."/../models/Post.php");
    require_once(__DIR__."/../models/Media.php");

    class PostController {
        public function createPost($data, $files){
            $postModel = new Post();
            $mediaModel = new Media();

            $newId = $postModel->insertPost($data);
            if(!$newId)
                return ["status" => "error", "message" => "Failed to create a new post"];

            $mediaModel->saveMediaFiles($newId, $files);
            return ["status" => "succes"];
        }

        public function getPostInfo($data){
            $id = $data['id'] ?? '';
            $postModel = new Post();
            return $postModel->postInfo($id);
        }

        public function getPostsFromPage($data){
            $page = $data['page'] ?? '';
            $postModel = new Post();
            return $postModel->getPostsFromPage($page);
        }

        public function getPostCount(){
            $postModel = new Post();
            return $postModel->getPostCount();
        }
    }
?>