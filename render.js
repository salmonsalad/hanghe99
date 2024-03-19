export function jsx(type, props, ...children) {
  return { type, props, children };
}

export function createElement(node) {
  // jsx를 dom으로 변환

  // 노드가 문자열인 경우, 텍스트 노드를 생성
  if (typeof node === 'string') {
    return document.createTextNode(node);
  }

  // 노드가 문자열이 아닌 경우
  // 1.  node가 객체인 경우, type 속성을 기반으로 해당하는 실제 DOM 요소를 생성
  const element = document.createElement(node.type);

  //2. 노드의 속성(props)을 반복 있는 경우 attribute로 넣어줍니다.
  Object
    //Object.entries() : 키-값 배열을 반환
    //node.props가 null 또는 undefined일 때 빈 객체 {}를 반환
     //props 속성을 사용하여 DOM 요소의 속성을 설정
    .entries(node.props ?? {}) 
    .forEach(([ key, value ]) => {
      //각 속성의 키와 값은 DOM 요소의 속성 이름과 값으로 사용
      element.setAttribute(key, value);
  });

  // 3. 노드에 children이 있는 경우 자식 엘리먼트를 추가 생성하여 노드 하위로 넣어줍니다.
  node.children?.forEach((child) => {
    element.appendChild(createElement(child));
  });

  return element; //생성된 실제 DOM 요소를 반환
}

function updateAttributes(target, newProps, oldProps) {
  // newProps가 존재하면서 객체인지 확인하여 처리합니다.
  if (newProps && typeof newProps === 'object') {
    // newProps들을 반복하여 각 속성과 값을 확인
    for (const [newPropKey, newPropValue] of Object.entries(newProps)) {
      // 만약 oldProps에 같은 속성이 있고 값이 동일하다면 다음 속성으로 넘어감 (변경 불필요)
      if (oldProps.hasOwnProperty(newPropKey) && oldProps[newPropKey] === newPropValue) {
        continue;
      }
      // 만약 위 조건에 해당하지 않는다면 (속성값이 다르거나 구속성에 없음) target에 해당 속성을 새 값으로 설정
      target.setAttribute(newPropKey, newPropValue);
    }
  }

  // oldProps가 존재하면서 객체인지 확인하여 처리합니다.
  if (oldProps && typeof oldProps === 'object') {
    // oldProps을 반복하여 각 속성 확인
    for (const oldPropKey of Object.keys(oldProps)) {
      // 만약 newProps들에 해당 속성이 존재한다면 다음 속성으로 넘어감 (속성 유지 필요)
      if (newProps && newProps.hasOwnProperty(oldPropKey)) {
        continue;
      }
      // 만약 newProps들에 해당 속성이 존재하지 않는다면 target에서 해당 속성을 제거
      target.removeAttribute(oldPropKey);
    }
  }
}


export function render(parent, newNode, oldNode, index = 0) {
  // 1. 만약 newNode가 없고 oldNode만 있다면
  if (!newNode && oldNode) { 
    //   parent에서 oldNode를 제거
    parent.removeChild(parent.childNodes[index]);
     //   종료
    return;
  }

  // 2. 만약 newNode가 있고 oldNode가 없다면
  if (newNode && !oldNode) { 
    //   newNode를 생성하여 parent에 추가
    parent.appendChild(createElement(newNode));
    //   종료
    return;
  }

  // 3. 만약 newNode와 oldNode 둘 다 문자열이고 서로 다르다면
  if (typeof newNode === 'string' && typeof oldNode === 'string' && newNode !== oldNode) {
    //   oldNode를 newNode로 교체
    parent.replaceChild(createElement(newNode), parent.childNodes[index]);
    //   종료
    return;
  }

  // 4. 만약 newNode와 oldNode의 타입이 다르다면
  if (typeof newNode !== typeof oldNode || newNode.type !== oldNode.type) {
    //   oldNode를 newNode로 교체
    parent.replaceChild(createElement(newNode), parent.childNodes[index]);
    //   종료
    return;
  }

  // 5. newNode와 oldNode에 대해 updateAttributes 실행
  // 성능향상 : 새로운 노드가 텍스트 노드인 경우에는 속성이 없으므로 updateAttributes 함수를 호출할 필요가 없습니다. 
  if (typeof newNode !== 'string') {
    updateAttributes(parent.childNodes[index], newNode.props, oldNode.props);
  }

  // 6. newNode와 oldNode 자식노드들 중 더 긴 길이를 가진 것을 기준으로 반복
  if (newNode.children && oldNode.children) {
    const maxLength = Math.max(newNode.children.length, oldNode.children.length);
    for (let i = 0; i < maxLength; i++) {
      //   각 자식노드에 대해 재귀적으로 render 함수 호출
      render(parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
    }
  }
  // const maxLength = Math.max((oldNode.children ? oldNode.children.length : 0), (newNode.children ? newNode.children.length : 0));
  // for (let i = 0; i < maxLength; i++) {
  //   render(parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
  // }
}