class HardWork {
    constructor() {
      this._result = 0;
      this._tasks = this._initTasks();
    }
  
    do() {
      // Promise 체이닝을 통해 각 태스크를 순차적으로 실행
      this._executeTasks(0);
    }
  
    // do() 이외의 메서드는 수정하지 않습니다.
    get result() {
      return this._result;
    }
  
    _initTasks() {
      const count = 30000;
      const tasks = new Array(count);
  
      for (let i = 0; i < count; i++) {
        tasks[i] = this._createTask(Math.floor(Math.random() * 3) + 1);
      }
  
      return tasks;
    }
  
    _createTask = (n) => () => {
      return new Promise((resolve) => {
        for (let i = 0; i < 1000; i++) {
          const randnum = Math.random();
          const alpha = Math.floor(randnum * 10) % n;
  
          if (alpha > 0) {
            this._result += alpha;
          }
        }
  
        this._sendLog().then(resolve); // 로그 전송 완료 후 resolve 호출
      });
    }
  
    _sendLog() {
      return new Promise((resolve) => {
        const blob = new Blob([JSON.stringify({
          value: this._result.toFixed(2),
        }, null, 2)], {
          type: "application/json",
        });
  
        const reader = new FileReader();
        reader.onload = function() {
          JSON.parse(reader.result); // 비동기로 읽은 후에 파싱
          resolve(); // 파싱 완료 후 resolve 호출
        };
        reader.readAsText(blob);
      });
    }
  }
  
  // 나머지 코드는 수정하지 않습니다.
  