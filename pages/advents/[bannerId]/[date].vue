<template>
  <div class="main">
    <h1 class="title">アドベントカレンダーに投稿</h1>
    <p class="text-red-500">※投稿や編集、削除ができるのは期間までです。</p>
    <div>
      <p>選択した日付: {{ date }}</p>
    </div>
    <h2 class="subtitle">投稿する記事の選択</h2>

    <select
      id="articles"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      v-model="selectedArticleId"
    >
      <option value="">選択してください</option>
      <option
        v-for="article in articles.sort((a, b) => a.id - b.id)"
        :key="article.id"
        :value="article.id"
      >
        {{ article.title }}
      </option>
    </select>
    <p v-if="!selectedArticleId" class="text-red-500">記事を選択してください</p>
  </div>
  <div class="flex justify-end">
    <div>
      <button
        class="btn m-3 block"
        @click="submitHandler"
        :disabled="!selectedArticleId"
      >
        投稿
      </button>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: "アドベントカレンダー記事投稿",
});
// 取得したuserIdを使って、articleテーブルからuserIdが一致するものを取得してタイ
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import dayjs from "dayjs";

// 引数を受け取る変数
const bannerId = ref(null);
const date = ref(null);
const selectedArticleId = ref(null);
const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const userId = user.value?.id;
const title = ref("");
const articles = ref([]);
const route = useRoute();
const isArticleSelected = ref(false);
const othersArticle = ref([]);

onMounted(async () => {
  bannerId.value = route.params.bannerId;
  date.value = route.params.date;

  const { data: userArticles } = await supabase
    .from("article")
    .select("*")
    .eq("userId", userId)
    .eq("publish", true)
    .eq("delete", false);
  articles.value = userArticles;

  const { data: matchingArticles, error } = await supabase
    .from("article")
    .select("*")
    .eq("publish", true)
    .eq("delete", false)
    .eq("publishDate", date.value)
    .eq("bannerId", bannerId.value);

  if (error) {
    console.log("マッチした記事のフェッチにエラーが出ました：", error);
  } else {
    othersArticle.value = matchingArticles;
  }
});

// 投稿ボタンを押した時の処理
const submitHandler = async () => {
  if (!selectedArticleId.value) {
    isArticleSelected.value = false;
    return;
  }
  if (othersArticle.value.length > 0) {
    alert("この日付に投稿している人がいます。別日に投稿してください。");
    return;
  }
  // articleIdを取得する
  const { data: articleId } = await supabase
    .from("article")
    .select("id")
    .eq("userId", userId)
    .eq("id", selectedArticleId.value);

  // bannerIdとpublishDateをarticleテーブルにデータを更新する
  const { data, error } = await supabase
    .from("article")
    .update({
      bannerId: bannerId.value,
      publishDate: date.value,
      publish: true,
    })
    .eq("id", articleId[0].id);

  if (error) {
    console.error("データ更新エラー:", error);
    return;
  }
  console.log("データ更新成功:", data);
  // ページをリロードする
  router.back();
};
</script>
