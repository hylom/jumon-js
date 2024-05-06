import { Jumon } from '../lib/jumon.js';

describe("Jumon", function () {
  let testForm01;
  let testForm02;

  afterEach(function () {
    // revert form values
    testForm01.width = 50;
    testForm01.height = 100;
    testForm01.text01 = "T_E_S_T";
    testForm01.text02 = "T_E_S_T_0_2";
    testForm01.text03 = 100;
  });

  describe("#constructor", function () {
    it("create valid instance", function () {
      const elem = document.getElementById("jumon-test-form01");
      testForm01 = new Jumon(elem);
      should.exist(testForm01);
      testForm01.twice = x => x*2;
      testForm01.setWidth222 = function (event) {
        testForm01.width = 222;
        event.preventDefault();
      };
      testForm01.setWidth = function (val) {
        testForm01.width = val;
      };
      testForm01.setHeight = function (event, val) {
        testForm01.height = val;
        event.preventDefault();
      };
    });
    it("create valid instance with initalValue", function () {
      const elem = document.getElementById("jumon-test-form02");
      testForm02 = new Jumon(elem, { value: 100 });
      should.exist(testForm02);
      testForm02.should.have.property("value", 100);
    });
  });

  describe("jumon-bind", function () {
    it("can get value of <input> element", function () {
      testForm01.width.should.equal(50);
      testForm01.height.should.equal(100);
      testForm01.name.should.equal("123");
    });
    it("can set value of <input> element", function () {
      testForm01.width = 111;
      testForm01.width.should.equal(111);
      document.getElementById("j-form01-width").textContent = "111";
    });
  });
  
  describe("jumon-bind-to", function () {
    it("can bind value to other", function () {
      testForm01.width = 120;
      document.getElementById("j-form01-test01")
        .getAttribute("maxlength")
        .should.equal("120");
    });
    it("can bind value to other with converter", function () {
      testForm01.height = 10;
      document.getElementById("j-form01-test02")
        .getAttribute("maxlength")
        .should.equal("20");
    });
  });

  describe("jumon-text", function () {
    it("can get text content  of element", function () {
      testForm01.text01.should.equal("T_E_S_T");
      testForm01.text02.should.be.NaN;
      testForm01.text03.should.equal(100);
    });
    it("can set text content of element", function () {
      testForm01.text01 = 123;
      testForm01.text01.should.equal("123");
      testForm01.text02 = 456;
      testForm01.text02.should.equal(456);
      testForm01.text03 = 789;
      testForm01.text03.should.equal(789);
    });
  });

  describe("jumon-foreach", function () {
    it("ignore elements with jumon-foreach attribute", function () {
      testForm01.should.not.have.property("title");
    });
    it("can create array of elements", function () {
      //testForm01.should.have.property("items").and.lengthOf(3);
      testForm01.items[0].should.deep.equal({ title: "item1" });
      testForm01.items[1].should.deep.equal({ title: "item2" });
      testForm01.items[2].should.deep.equal({ title: "item3" });
    });
    it("can create array of elements with nested element", function () {
      testForm01.should.have.property("items2").and.lengthOf(2);
      testForm01.items2[0].should.deep.equal({ title: "A" });
      testForm01.items2[1].should.deep.equal({ title: "B" });
    });
    it("can create blank array with template", function () {
      testForm01.should.have.property("items3").and.lengthOf(0);
      });
    it("can support element insertion with unshift", function () {
      testForm01.items3.unshift({ title: "foo"});
      testForm01.should.have.property("items3").and.lengthOf(1);
      testForm01.items3[0].should.deep.equal({ title: "foo" });
      document.getElementById("j-form01-ul3").children[0]
        .tagName.should.equal("LI");
      });
    it("can support element insertion with push", function () {
      testForm01.items2.push({ title: "C" });
      testForm01.should.have.property("items2").and.lengthOf(3);
      testForm01.items2[2].should.deep.equal({ title: "C" });
      });
    it("can support element deletion", function () {
      const p = testForm01.items2.pop();
      testForm01.should.have.property("items2").and.lengthOf(2);
      p.should.have.property("title", "C");
      p.should.deep.equal({ title: "C" });
      testForm01.items2.pop();
      testForm01.items2.pop();
      testForm01.items2.pop();
      testForm01.should.have.property("items2").and.lengthOf(0);
      testForm01.items2.unshift({ title: "X" });
      testForm01.items2.unshift({ title: "Y" });
      //testForm01.items2.push({ title: "Y" });
      //testForm01.items2.push({ title: "X" });
      testForm01.should.have.property("items2").and.lengthOf(2);
      testForm01.items2[0].should.deep.equal({ title: "Y" });
      testForm01.items2[1].should.deep.equal({ title: "X" });
    });
    it("can create with array of scalar", function () {
      testForm02.items.push("foo");
      testForm02.items.push("bar");
      testForm02.items.length.should.equal(2);
      //testForm02.items.getAt(0).should.equal("foo");
      //testForm02.items.getAt(1).should.equal("bar");
      testForm02.items[0].should.equal("foo");
      testForm02.items[1].should.equal("bar");
      const items = document.getElementById("j-form02-ul").querySelectorAll("li");
      items.length.should.equal(2);
      items.item(0).textContent.should.equal("foo");
      items.item(1).textContent.should.equal("bar");
    });
    it("can update array with splice", function () {
      testForm02.items.splice(1, 1, "hoge").should.deep.equal(["bar"]);
      testForm02.items.should.be.lengthOf(2);
      testForm02.items[0].should.equal("foo");
      testForm02.items[1].should.equal("hoge");
      const items = document.getElementById("j-form02-ul").querySelectorAll("li");
      items.should.be.lengthOf(2);
      items.item(0).textContent.should.equal("foo");
      items.item(1).textContent.should.equal("hoge");
    });
  });

  describe("jumon-listen", function () {
    it("can invoke event handler", function () {
      document.getElementById("j-form01-btn01").click();
      testForm01.width.should.equal(222);
    });
  });

  describe("jumon-listener", function () {
    it("can invoke event handler with only handler name", function () {
      document.getElementById("j-form01-btn02").click();
      testForm01.width.should.equal(222);
    });
    it("can invoke event handler with handler name and argument", function () {
      document.getElementById("j-form01-btn03").click();
      testForm01.width.should.equal(333);
    });
    it("can invoke event handler with handler name and event argument", function () {
      document.getElementById("j-form01-btn04").click();
      testForm01.height.should.equal(444);
    });
  });

  describe("jumon-placeholder", function () {
    it("can set Jumon element", function () {
      const el = document.createElement("div");
      el.setAttribute("jumon-text", "text");
      testForm01.ext1 = new Jumon(el);
      testForm01.ext1.text = "hoge";
      testForm01.should.have.property("ext1");
      testForm01.ext1.should.deep.equal({ text: "hoge" });
      document.getElementById("j-form01-ext1")
        .children[0].textContent.should.equal("hoge");
    });
  });
});

