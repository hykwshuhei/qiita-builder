<template>
  <div class="my-20">
    <div>
      <input
        class="border pt-2 pl-2 rounded-lg"
        placeholder="タイトル"
        v-model="title"
        style="width: 100%; height: 50px"
        maxlength="255"
      />
      <div>
        <span class="text-red-500 mt-2">
          {{ errorTitle }}
        </span>
        <span class="block text-right">{{ title.length }}/255</span>
      </div>
    </div>
    <div>
      <div class="mt-5">
        <textarea
          ref="contentArea"
          v-model="content"
          rows="5"
          placeholder="markdown形式で説明を記述できます。"
          maxlength="255"
        ></textarea>
        <div>
          <span class="text-red-500">
            {{ errorContent }}
          </span>
          <span class="block text-right">{{ content.length }}/255</span>
        </div>
      </div>
    </div>
    <div class="flex justify-around mt-8">
      <div class="block" v-if="qiitaToken">
        <label for="like">Qiita自動投稿</label>
        <br />
        <select
          name="like"
          id="like"
          class="border border-black py-1 px-2 rounded-md mt-2"
          v-model="goalLike"
        >
          <option value="">選択してください</option>
          <option value="null">設定しない</option>
          <option value="5">5いいね</option>
          <option value="10">10いいね</option>
          <option value="15">15いいね</option>
          <option value="20">20いいね</option>
        </select>
      </div>
      <div>
        <div class="flex">
          <p>公開日</p>
          <span class="text-xs w-32 ml-2"
            >※選択しない場合、本日の日付が設定されます</span
          >
        </div>
        <input
          type="date"
          class="border border-black py-1 px-2 rounded-md"
          style="width: 175px"
          v-model="publishDate"
          :min="new Date().toISOString().split('T')[0]"
        />
      </div>
      <div class="mr-3">
        <div>
          <v-col>
            <v-combobox
              v-model="select"
              :items="items"
              label="タグを設定してください"
              multiple
              chips
              style="width: 350px"
            ></v-combobox>
          </v-col>
        </div>
        <p class="text-red-500 ml-5">
          {{ errorTag }}
        </p>
      </div>
      <div class="mt-4">
        <span class="mr-4">
          <button type="submit" class="btn text-right" @click="submitHandler">
            投稿する
          </button>
        </span>
        <span>
          <button
            type="submit"
            class="border py-2 px-2 rounded-md"
            @click="draftHandler"
          >
            下書き保存
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type EasyMDE from "easymde";
import { marked } from "marked";
import { ref } from "vue";
import { useRouter } from "vue-router";

useHead({
  title: "新規記事投稿",
});

let mde: InstanceType<typeof EasyMDE> | null = null;
let items = ref([
  "Java",
  "PHP",
  "JavaScript",
  "Python",
  "Ruby",
  "フロントエンド",
  "バックエンド",
  "クラウド",
]);

const date = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

const select = ref([]);
const content = ref("");
const contentArea = ref();
const title = ref("");
const goalLike = ref("");
const publishDate = ref(date);
const router = useRouter();
const users = useSupabaseUser();
const userId = users.value?.id;
const qiitaToken = ref(null);
let occupationId = ref(null);
let clubId = ref(null);
let errorTitle = ref("");
let errorContent = ref("");
let errorTag = ref("");

//記事投稿
async function submitHandler() {
  //エラーの初期化
  errorTitle.value = "";
  errorContent.value = "";
  errorTag.value = "";

  // 前後の空白を消去
  title.value = title.value.trim();
  content.value = content.value.trim();

  //バリデーションチェック
  if (title.value.length === 0) {
    errorTitle.value = "タイトルを入力してください";
  } else if (title.value.length > 255) {
    errorTitle.value = "タイトルを255字以内で入力してください";
  }
  if (content.value.length === 0) {
    errorContent.value = "内容を入力してください";
  } else if (content.value.length > 255) {
    errorContent.value = "内容を255字以内で入力してください";
  }
  if (select.value.length === 0) {
    errorTag.value = "タグを一つ以上入力してください";
  }
  console.log(select);
  select.value.map((tag: string) => {
    if (tag.length > 30) {
      errorTag.value = "タグは各30字以内で入力してください";
    }
  });

  if (
    errorTitle.value === "" &&
    errorContent.value === "" &&
    errorTag.value === ""
  ) {
    const postData = {
      userId: userId,
      clubTagId: clubId,
      occupationTagId: occupationId,
      bannerId: null,
      qiitaPost: false,
      delete: false,
      title: title,
      body: content,
      goalLike: goalLike,
      date: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
      publishDate: publishDate,
      publish: true,
    };
    const { data, error } = await useFetch("/api/article/post", {
      method: "POST",
      body: { article: postData, tagArray: select.value },
    });
    router.push("/");
  }
}

// 下書き記事の投稿
const draftHandler = async () => {
  // 前後の空白を消去
  title.value = title.value.trim();
  content.value = content.value.trim();

  const postData = {
    userId: userId,
    clubTagId: clubId,
    occupationTagId: occupationId,
    bannerId: null,
    qiitaPost: false,
    delete: false,
    title: title,
    body: content,
    goalLike: goalLike,
    date: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
    publishDate: publishDate,
    publish: false,
  };
  const { data, error } = await useFetch("/api/article/post", {
    method: "POST",
    body: { article: postData, tagArray: select.value },
  });
  router.push("/myPage");
};

onMounted(async () => {
  try {
    const EasyMDE = (await import("easymde")).default;
    mde = new EasyMDE({
      element: contentArea.value!.$el,
      spellChecker: false,
      status: false,
      previewRender: (markdownPlaintext) => {
        const htmlContent = marked(markdownPlaintext);
        return `<div class="markdown-preview">${htmlContent}</div>`;
      },
    });
    mde.codemirror.on("change", () => {
      if (mde) {
        content.value = mde.value();
      }
    });
    //ユーザーIDからクラブと職種を取得したい
    const users = useSupabaseUser();
    const userId = users.value?.id;
    clubId.value = (
      await useFetch("/api/user/get", {
        method: "POST",
        body: userId,
      })
    ).data.value?.clubid.id;

    occupationId.value = (
      await useFetch("/api/user/get", {
        method: "POST",
        body: userId,
      })
    ).data.value?.occupation.id;

    qiitaToken.value = (
      await useFetch("/api/user/getQiitaToken", {
        method: "POST",
        body: userId,
      })
    ).data.value;
  } catch (error) {
    console.log(error);
  }
});
</script>
<style>
.markdown-preview ul,
.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview p,
.markdown-preview a,
.markdown-preview blockquote,
.markdown-preview pre,
.markdown-preview img,
.markdown-preview table,
.markdown-preview th,
.markdown-preview td,
.markdown-preview strong,
.markdown-preview em {
  all: revert;
}
</style>
