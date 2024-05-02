import { Jumon } from '../lib/jumon.js';

describe("Jumon", function () {
  let testForm01;

  afterEach(function () {
    // revert form values
    testForm01.width = 50;
    testForm01.height = 100;
  });

  describe("#constructor", function () {
    it("create valid instance", function () {
      const elem = document.getElementById("jumon-test-form01");
      testForm01 = new Jumon(elem);
      should.exist(testForm01);
      testForm01.twice = x => x*2;
      testForm01.update = function (event) {
        testForm01.width = 222;
        event.preventDefault();
      };
    });
  });

  describe("jumon-bind", function () {
    it("can get value of <input> element", function () {
      testForm01.width.should.equal(50);
      testForm01.height.should.equal("100");
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

  describe("jumon-listen", function () {
    it("can invoke event handler", function () {
      document.getElementById("j-form01-btn01").click();
      testForm01.width.should.equal(222);
    });
  });
});

