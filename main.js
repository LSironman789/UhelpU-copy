import { Assets } from "./js/AssetsManager.js";
import { AppCoordinator } from "./js/AppCoordinator.js";

// 纯 p5 实例模式，所有依赖都通过 p 实例传递
new p5((p) => {
  let app;

  p.setup = async () => {
    p.createCanvas(1366, 768);

    // p5.js 2.0: 在 setup 中用 await 加载资源
    await Assets.loadAll(p);
    app = new AppCoordinator(p);

    // --- 新增：读取网址里的参数 (小尾巴) ---
    let params = new URLSearchParams(window.location.search);
    
    if (params.has('world') && params.has('level')) {
      let targetWorld = parseInt(params.get('world'));
      let targetLevel = parseInt(params.get('level'));
      console.log(`检测到链接参数：准备直接进入 World ${targetWorld} Level ${targetLevel}`);
      
      // 将参数传递给 init 方法
      app.init(targetWorld, targetLevel); 
    } else {
      // 正常打开游戏，无参数
      app.init();
    }
  };

  p.draw = () => {
    if (!app) {
      return;
    }
    app.updateFrame();
  };
});

// 纯 p5 实例模式，所有依赖都通过 p 实例传递
// new p5((p) => {
//   let app;

//   p.setup = async () => {
//     p.createCanvas(1366, 768);

//     // p5.js 2.0: 在 setup 中用 await 加载资源
//     await Assets.loadAll(p);
//     app = new AppCoordinator(p);
//     app.init();
//   };

//   p.draw = () => {
//     if (!app) {
//       return;
//     }
//     app.updateFrame();
//   };
// });

