<template>
  <div class="main">
    <div class="flex flex-col md:flex-row">
      <div class="md:w-2/3 p-4">
        <!-- アイコン・ユーザ名・投稿日 -->
        <div class="flex items-center mb-4 justify-between">
          <div class="flex items-center">
            <!-- アイコン -->
            <img
              v-if="articleUsers.image"
              :src="articleUsers.image"
              alt="User"
              class="w-8 h-8 rounded-full mr-2"
            />
            <!-- ユーザ名 -->
            <span v-if="articleUsers" class="text-gray-600 text-sm">{{
              articleUsers.username
            }}</span>
            <span class="text-gray-400 text-sm mx-2">&nbsp;&nbsp;&nbsp;</span>
            <!-- 投稿日 -->
            <span v-if="formattedDate" class="text-gray-600 text-sm"
              >投稿：{{ formattedDate }}</span
            >
          </div>

          <NuxtLink
            v-if="articleDatas[0].userId === userId"
            :to="`/articles/edit/${articleId}`"
          >
            <button
              type="submit"
              class="mb-2 mr-10 mb-5 bg-[#FFFFFF] border-indigo-700 px-4 py-2 rounded-md text-base border hover:bg-[#1D8EB9] hover:text-white"
            >
              編集
            </button>
          </NuxtLink>
        </div>
        <!-- 記事タイトル -->
        <h1 v-if="articleData" class="text-4xl font-bold mb-2">
          <span class="break-words">
            {{ articleData.title }}
          </span>
        </h1>
        <hr class="border-t-2 border-gray-200" />
        <!-- カテゴリタグ -->
        <div v-if="tagNames" class="flex flex-wrap space-x-2 space-y-2 m-4">
          <span
            v-for="(tagName, index) in tagNames"
            :key="index"
            class="bg-blue-100 text-blue-600 px-2 py-1 rounded my-1"
            >{{ tagName }}</span
          >
        </div>

        <div class="text-gray-800 mb-4" id="parent-element">
          <!-- tailwindcssのスタイルを無効化するcustom-proseクラス -->
          <template v-if="htmlText">
            <span class="custom-prose" v-html="htmlText"></span>
          </template>
          <template v-else>
            <span></span>
          </template>
        </div>

        <div class="flex justify-end space-x-4">
          <button
            @click="countLike(e)"
            v-if="!showLikeButton"
            class="bg-white border-indigo-700 px-4 py-2 rounded-md text-base border hover:text-gray-900"
          >
            いいね！
          </button>
          <button
            @click="countLike(e)"
            v-else
            class="bg-red-500 px-4 py-2 rounded-md text-base text-white border hover:text-gray-900"
          >
            いいね！
          </button>
          <button
            @click="countRecommend(e)"
            v-if="!showRecommendButton"
            class="bg-white border-indigo-700 px-4 py-2 rounded-md text-base border hover:text-gray-900"
          >
            おすすめ
          </button>
          <button
            @click="countRecommend(e)"
            v-else
            class="bg-[#1D8EB9] px-4 py-2 rounded-md text-base text-white border hover:text-gray-900"
          >
            おすすめ
          </button>
        </div>
      </div>

      <!-- いいね数・目標までのいいね数・Qiitaオススメした人数 -->
      <div class="md:w-1/3 m-4 p-4 bg-gray-100 max-h-96">
        <div class="mb-4">
          <p class="text-gray-600 text-lg flex justify-center">
            現在の「いいね！」
          </p>
          <p class="text-red-500 text-4xl font-bold flex justify-center m-4">
            {{ nowLike }}
            <span class="text-lg text-gray-600 align-text-bottom pt-3">件</span>
          </p>
        </div>
        <div v-show="goalLike !== null" class="my-8">
          <span class="text-gray-600 text-lg flex justify-center"
            >目標まで残り</span
          >
          <p
            v-if="
              articleData &&
              goalLike > 0 &&
              !articleData.qiitaPost &&
              !qiitaPostCheck
            "
            class="text-red-500 text-4xl font-bold flex justify-center m-4"
          >
            {{ goalLike }}
            <span class="text-lg text-gray-600 align-text-bottom pt-3">件</span>
          </p>
          <p
            v-else
            class="text-red-500 text-4xl font-bold flex justify-center m-4"
          >
            {{ goalLikeSuccess }}
          </p>
        </div>
        <div class="mb-4">
          <span class="text-gray-600 text-lg flex justify-center"
            >Qiitaオススメ</span
          >
          <p class="text-[#1D8EB9] text-4xl font-bold flex justify-center m-4">
            {{ nowRecommend }}
            <span class="text-lg text-gray-600 align-text-bottom pt-3">人</span>
          </p>
        </div>
      </div>
    </div>

    <!-- コメントフォーム -->
    <div class="p-4 bg-gray-100">
      <h2 class="text-xl font-bold mb-2">コメント</h2>
      <form class="flex flex-col items-end" @submit.prevent="submit">
        <textarea
          v-model="comment"
          name="comment"
          id="comment"
          rows="5"
          placeholder="コメントを入力してください"
          class="w-full border border-gray-200 p-2 rounded"
          maxlength="255"
          oninput="document.getElementById('charCount').textContent = this.value.length + '/255'"
        ></textarea>
        <!-- <p v-if="errorText" class="text-red-500">コメントを入力してください</p> -->
        <p class="text-red-500">{{ commentErrorText }}</p>
        <div class="flex mt-3">
          <div id="charCount" class="mt-4 mr-2">0/255</div>
          <button type="submit" class="btn">送信</button>
        </div>
      </form>
      <div>
        <h2 class="text-xl font-bold mb-2">投稿済みのコメント</h2>
        <!-- 過去のコメントを表示するループ -->
        <div
          class="bg-gray-200 p-2 rounded my-3 flex justify-between items-center"
          v-for="commented in commentDate"
          :key="commented.id"
        >
          <div class="mr-5 w-full">
            <div class="flex justify-between">
              <div class="font-semibold">{{ commented.username }}</div>
              <button
                class="btn"
                @click="(open = true), (deleteItem = commented.id)"
                v-show="commented.userId == userId"
              >
                削除
              </button>
              <Teleport to="body">
                <div v-if="open" class="modal">
                  <div class="modal-content">
                    <p class="mb-5">本当に削除しますか？</p>
                    <button @click="open = false" class="btn mr-5">No</button>
                    <button @click="deleteComment(deleteItem)" class="btn">
                      Yes
                    </button>
                  </div>
                </div>
              </Teleport>
            </div>
            <p class="text-gray-600">{{ commented.comment }}</p>
          </div>
        </div>
        <button
          v-show="showMoreComment"
          @click="showMoreCommentClick"
          class="mt-4 underline decoration-sky-500"
        >
          もっと見る
        </button>
        <button
          v-show="showCloseComment"
          @click="showCommentClick"
          class="mt-4 underline decoration-sky-500"
        >
          閉じる
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "記事詳細",
});

import LikeButton from "~/components/LikeButton.vue";
import RecommendButton from "~/components/RecommendButton.vue";
import { ref } from "vue";
import { marked } from "marked";
import { createClient } from "@supabase/supabase-js";
import { toUnicode } from "punycode";

//.envからsupabaseのurlとkeyを取得
const runtimeConfig = useRuntimeConfig();
//supabaseのurlとkeyを使ってcreateClientを作成
const supabase = createClient(
  runtimeConfig.public.supabase.url,
  runtimeConfig.public.supabase.key
);

//モーダルの表示非表示
const open = ref(false);
const deleteItem = ref();
const route = useRoute();
const users = useSupabaseUser();
const router = useRouter();

//表示する値の変更値
const nowLike = ref(0);
const nowRecommend = ref(0);
const goalLimitNum = ref(0);
const goalLike = ref();
const goalLikeSuccess = ref("");

//コメント文字数制限
const errorText = ref(false);
const commentErrorText = ref("　　　");

//ユーザーIdを取得
let userId = "";
if (users.value) {
  userId = users.value.id;
}
//ユーザー情報取得
let userInfo = ref();
const { data: userData } = await useFetch("/api/user/userGet", {
  method: "POST",
  body: userId,
});
userInfo.value = userData.value;
//現在の日付取得
let date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();
//自動投稿用
const dateString = `${year}/${month}/${day}`;

//記事IDを取得
let articleId = route.params.id;
//投稿者の情報を取得
let articleUsers = ref();
// 記事情報を取得[始まり]
let articleData = ref();
let htmlText = ref();
let formattedDate = ref();
let articleTagIds = [];
let tagNames = ref();

const { data: articleDatas } = await useFetch("/api/article/articleDateGet", {
  method: "POST",
  body: articleId,
});
const { data: articleUser } = await useFetch("/api/user/userGet", {
  method: "POST",
  body: articleDatas.value[0].userId,
});
articleUsers.value = articleUser.value[0];
articleData.value = articleDatas.value[0];

//記事の公開日判定
//公開日のミリ秒取得
const display = ref(false);
let articleDate = articleData.value.publishDate;
articleDate = new Date(articleDate);
const articleDateMs = articleDate.getTime();
//現在のミリ秒取得
const dateMs = date.getTime();
//記事詳細画面表示条件
if (
  articleDateMs - dateMs > 0 &&
  articleUsers.value.id !== userInfo.value[0].id
) {
  router.push("/");
}

// mangleパラメータ・headerIdsパラメータを無効化するために{mangle: false, headerIds: false }}を設定
htmlText.value = marked.parse(articleDatas.value[0].body, {
  mangle: false,
  headerIds: false,
});
// 日時のフォーマットを設定
const options = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
};
const dateObject = new Date(articleDatas.value[0].date);
// フォーマットを適用
formattedDate.value = dateObject.toLocaleString("ja-JP", options);
//タグ取得
const { data: tagIds } = await useFetch("/api/tagging/get", {
  method: "POST",
  body: articleId,
});
const { data: tags } = await useFetch("/api/tag/get", {
  method: "POST",
  body: tagIds.value,
});
tagNames.value = tags.value;

//　　　　　　　おすすめ数表示機能　　　　　　　　　　//
//おすすめボタンクリック済みか確認
const showRecommendButton = ref(false);
// おすすめ数取得;
const { data: recommends } = await useFetch("/api/recommend/articleGet", {
  method: "POST",
  body: articleId,
});
//おすすめ数取得
nowRecommend.value = recommends.value.length;
// ユーザーがおすすめしているかどうかの確認
const { data: recommendUsers } = await useFetch("/api/recommend/get", {
  method: "POST",
  body: { articleId, userId },
});
//おすすめボタン色の切り替え
if (recommendUsers.value[0]) {
  showRecommendButton.value = true;
} else {
  showRecommendButton.value = false;
}

/////////////おすすめボタンをクリックした時//////////////
const countRecommend = async (e) => {
  showRecommendButton.value = !showRecommendButton.value;
  if (showRecommendButton.value === true) {
    //おすすめ数を追加
    await supabase.from("recommend").insert({ userId, articleId });
    // nowRecommend.value = nowRecommend.value + 1;
  } else {
    //おすすめ数を削除する
    await supabase
      .from("recommend")
      .delete()
      .eq("userId", userId)
      .eq("articleId", articleId);
    // nowRecommend.value = nowRecommend.value - 1;
  }
};

//リアルタイムでおすすめ数を取得
const nowRecommendcount = async function () {
  // おすすめ数取得;
  const { data: recommends } = await useFetch("/api/recommend/articleGet", {
    method: "POST",
    body: articleId,
  });
  //おすすめ数取得
  nowRecommend.value = recommends.value.length;
  // ユーザーがおすすめしているかどうかの確認
  const { data: recommendUsers } = await useFetch("/api/recommend/get", {
    method: "POST",
    body: { articleId, userId },
  });
  //おすすめボタン色の切り替え
  if (recommendUsers.value[0]) {
    showRecommendButton.value = true;
  } else {
    showRecommendButton.value = false;
  }
};

const supabaseRecommend = supabase
  .channel("recommend")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "recommend",
    },
    async (payload) => {
      nowRecommendcount();
    }
  )
  .subscribe();

// //　　　　　　　いいね数表示機能　　　　　　　　　　//
const showLikeButton = ref(false);
//////////////ページ表示時の処理//////////////
// 表示いいね数の取得
const { data: likes } = await useFetch("/api/like/likeNumberGet", {
  method: "POST",
  body: articleId,
});
nowLike.value = likes.value.length;
// ユーザーがいいねしているかどうかの確認
const { data: likeschecks } = await useFetch("/api/like/likeCheckGet", {
  method: "POST",
  body: { userId, articleId },
});
//いいねボタン色の切り替え
if (likeschecks.value[0]) {
  showLikeButton.value = true;
}
//記事の目標いいね取得
const articleDataGoalLike = Number(articleData.value.goalLike);
//目標いいねの表示切り替え
if (articleData.value.goalLike === null || articleData.value.goalLike === "") {
  goalLike.value = null;
} else {
  if (articleDataGoalLike - nowLike.value > 0) {
    //目標までの数表示
    if (articleData.value.qiitaPost) {
      goalLikeSuccess.value = "達成済み";
    } else {
      goalLike.value = articleDataGoalLike - nowLike.value;
    }
  } else {
    goalLikeSuccess.value = "達成済み";
  }
}

//////////////いいねボタンをクリックした時//////////////
const countLike = async (e) => {
  showLikeButton.value = !showLikeButton.value;
  if (showLikeButton.value === true) {
    //いいね数を追加
    await supabase.from("like").insert({ userId, articleId });
    // nowLike.value = nowLike.value + 1;
  } else {
    //いいね数を削除する
    await supabase
      .from("like")
      .delete()
      .eq("userId", userId)
      .eq("articleId", articleId);
    // nowLike.value = nowLike.value - 1;
  }
};

// //Qiita投稿に必要な情報取得
const articleQiitaToken = articleUsers.value.qiitaToken;
const articleBody = articleData.value.body;
const articleTitle = articleData.value.title;
// const articleQiitaPost = articleData.value.qiitaPost;
const articleTag = Object.keys(tagNames.value).map((key) => {
  return { name: tagNames.value[key] };
});
// //Qiita投稿済みかどうか確認
const qiitaPostCheck = ref(articleData.value.qiitaPost);

//リアルタイムでいいね数を取得
const nowLikecount = async function () {
  // ユーザーがいいねしているかどうかの確認
  const { data: realTimeLike } = await useFetch("/api/like/likeCheckGet", {
    method: "POST",
    body: { userId, articleId },
  });
  // いいね数の取得
  const { data: realTimeLikes } = await useFetch("/api/like/likeNumberGet", {
    method: "POST",
    body: articleId,
  });
  //記事情報取得(Qiita投稿済みかどうか確認)
  const { data: qiitaPostItem } = await useFetch(
    "/api/article/articleDateGet",
    {
      method: "POST",
      body: articleId,
    }
  );
  await new Promise((r) => setTimeout(r, 100));
  //いいね数の表示
  nowLike.value = realTimeLikes.value.length;
  if (realTimeLike.value[0]) {
    showLikeButton.value = true;
    //記事の目標いいね達成しているか確認
    if (
      articleData.value.goalLike === null ||
      articleData.value.goalLike === ""
    ) {
      goalLike.value = null;
    } else {
      if (articleDataGoalLike - nowLike.value > 0) {
        //目標までの数表示
        if (qiitaPostItem.value[0].qiitaPost) {
          goalLikeSuccess.value = "達成済み";
        } else {
          goalLike.value = articleDataGoalLike - nowLike.value;
        }
      } else if (!qiitaPostItem.value[0].qiitaPost) {
        goalLikeSuccess.value = "達成済み";
        ///自動投稿
        qiitaPostCheck.value = true;
        const autoPost = () => {
          const item = {
            body: articleBody, // マークダウン形式で記載が必要
            private: true, // 限定共有状態かどうかを表すフラグ (Qiita Teamでは無効)
            tags: articleTag,
            title: articleTitle,
            tweet: false, // Twitterに投稿するかどうか (Twitter連携を有効化している場合のみ有効)
          };
          fetch("https://qiita.com/api/v2/items", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${articleQiitaToken}`,
            },
            body: JSON.stringify(item),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(
                  "Request failed with status: " + response.status
                );
              }
              // 成功処理
              console.log("成功");
            })
            .catch(() => {
              // 失敗処理
              console.log("失敗");
            });
        };
        autoPost();
        await useFetch("/api/article/qiitaPostUpdate", {
          method: "POST",
          body: articleId,
        });
      } else {
        goalLikeSuccess.value = "達成済み";
      }
    }
  } else {
    showLikeButton.value = false;
    if (
      !(
        articleData.value.goalLike === null || articleData.value.goalLike === ""
      )
    ) {
      goalLike.value = articleDataGoalLike - nowLike.value;
    }
  }
};
const supabaseLike = supabase
  .channel("like")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "like",
    },
    async (payload) => {
      nowLikecount();
    }
  )
  .subscribe();

//　　　　　　　　コメント機能　　　　　　　　　//
let comment = ref("");
let commentError = ref("");
const commentDateOrigin = ref();
const commentDate = ref();
const showMoreComment = ref(false);
const showCloseComment = ref(false);

//投稿済みコメントを取得
const commentAcquisition = async function () {
  const { data: commentDates } = await useFetch("/api/comment/get", {
    method: "POST",
    body: articleId,
  });
  if (commentDates.value) {
    const { data: commentItem } = await useFetch("/api/user/commentUserGet", {
      method: "POST",
      body: commentDates.value,
    });
    commentDateOrigin.value = commentItem.value;
    //表示するコメント数を制限
    if (commentItem.value.length > 5) {
      commentDate.value = commentItem.value.slice(0, 5);
      showMoreComment.value = true;
      showCloseComment.value = false;
    } else {
      commentDate.value = commentItem.value;
      showMoreComment.value = false;
      showCloseComment.value = false;
    }
  } else {
    console.log("投稿済みコメントなし");
  }
};
commentAcquisition();

//リアルタイムでコメントを取得
const supabaseComment = supabase
  .channel("comment")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "comment",
    },
    async (payload) => {
      commentAcquisition();
    }
  )
  .subscribe();

//コメントをもっと見る
const showMoreCommentClick = () => {
  showMoreComment.value = false;
  showCloseComment.value = true;
  commentDate.value = commentDateOrigin.value;
};
//コメントを閉じる
const showCommentClick = () => {
  showMoreComment.value = true;
  showCloseComment.value = false;
  commentDate.value = commentDateOrigin.value.slice(0, 5);
};

//コメント送信
const submit = async () => {
  try {
    const trimmedEmail = comment.value.trim();
    if (comment.value.length > 0 && trimmedEmail.length > 0) {
      const { data: articleUser } = await useFetch("/api/comment/insert", {
        method: "POST",
        body: {
          date: dateString,
          userId: userId,
          comment: comment.value,
          articleId: articleId,
        },
      });
      commentErrorText.value = "　　";
      comment.value = "";
    } else {
      commentErrorText.value = "コメントを入力してください";
    }
  } catch (error) {
    console.log("コメント送信でエラー");
  }
};

//コメントを削除
const deleteComment = async (commentId) => {
  try {
    // 削除処理の実行
    await useFetch("/api/comment/delete", {
      method: "POST",
      body: commentId,
    });
    open.value = false;
  } catch (error) {
    console.error("コメントを削除でエラー");
  }
};
</script>

<style>
.custom-prose * {
  all: revert;
}

/* モーダルCSS */
.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  /* background-color: #959393; */
  background-color: rgba(149, 147, 147, 0.3);
}
.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 40px;
  border: 1px solid #888;
  width: 300px;
  text-align: center;
}
#parent-element {
  word-wrap: break-word;
}
</style>
