var formGenerationUtils = require('./client/scripts/formGenerationUtils.js');
var formValidationUtils = require('./server/cloud/formValidationUtils.js');

var formDef = {
  "meta": {
    "kind": "struct",
    "props": {
      "education": {
        "meta": {
          "kind": "maybe",
          "type": {
            "meta": {
              "kind": "list",
              "type": {
                "meta": {
                  "kind": "struct",
                  "props": {
                    "collegeName": {"meta": {"kind": "irreducible", "name": "Str"}},
                    "degree": {"meta": {"kind": "irreducible", "name": "Str"}},
                    "description": {"meta": {"kind": "irreducible", "name": "Str"}},
                    "endDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Dat"}}}},
                    "startDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Dat"}}}},
                  }
                }
              }
            }
          }
        }
      },
      "emailAddress": {"meta": {"kind": "irreducible", "name": "Str"}},
      "experience": {
        "meta": {
          "kind": "maybe",
          "type": {
            "meta": {
              "kind": "list",
              "type": {
                "meta": {
                  "kind": "struct",
                  "props": {
                    "companyName": {"meta": {"kind": "irreducible", "name": "Str"}},
                    "role": {"meta": {"kind": "irreducible", "name": "Str"}},
                    "description": {"meta": {"kind": "irreducible", "name": "Str"}},
                    "endDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Dat"}}}},
                    "startDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Dat"}}}},
                  }
                }
              }
            }
          }
        }
      },
      "firstName": {"meta": {"kind": "irreducible", "name": "Str"}},
      "lastName": {"meta": {"kind": "irreducible", "name": "Str"}},
      "roleType": {
        "meta": {
          "kind": "struct",
          "props": {
            "developer": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "doesntMatter": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "frontEndDeveloper": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "fullStackDeveloper": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "moneyForNothing": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "okay": {"meta": {"kind": "irreducible", "name": "Bool"}}
          }
        }
      },
      "employmentType": {
        "meta": {
          "kind": "struct",
          "props": {
            "contract": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "inter": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "partTime": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "permanent": {"meta": {"kind": "irreducible", "name": "Bool"}}
          }
        }
      },
      "summary": {"meta": {"kind": "irreducible", "name": "Str"}}
    }
  }
};

var formValue = {"education":[{"collegeName":"EURECOM","degree":"Master Multimedia Information Technologies","description":"Page3Activities and Societies:  Image and video Compression and Processing, Multimedia indexing and retrieval, 3-D and virtual imaging (analysis and synthesis), Speech and audio processing, Intelligent systems, Imaging for security applications watermarking & biometrics, Intelligent Systems","endDate":null,"startDate":null},{"collegeName":"Politecnico di Torino","degree":"Master of Science Computer Engineer","description":"Grade:  110/110 with honours","endDate":null,"startDate":null},{"collegeName":"Politecnico di Torino","degree":"Bachelor Computer Engineer","description":"Page4Alberto CeratiSoftware Development Engineer at Amazon Lab126cerati.alberto@gmail.com6","endDate":null,"startDate":null}],"emailAddress":"ernesto.mudu@gmail.com","experience":[{"companyName":"Amazon Lab126","role":"Software Development Engineer ","description":"FireOS Framework - Performance and Graphics team. Upleveling and porting of new Android (AOSP) releases to FireOS. System performance & graphics development, profiling and tuning across different vendors and products.","endDate":null,"startDate":null},{"companyName":"Texas Instruments","role":"Software Design Engineer ","description":"Working on the graphics performance of the Kindle Fire tablets. Android framework and apps tuning for the OMAP and SGX graphics cores. Benchmark, analysis, debugging and breakdown of bottlenecks on 2D and 3D applications.","endDate":null,"startDate":null},{"companyName":"Texas Instruments","role":"Software Design Engineer ","description":"Worked as part of the Android graphics team for OMAP SoC, ranging from the drivers up to the end-user Android apps. Provided support for different TI customers: performance evaluation on the GPU, analyzing bottlenecks & providing customized solutions for the HW utilized (SGX). Developed some internal graphic benchmarks, tools and demos using OpenGL ES 1.1 / 2.0 and OpenCL on Android (native and apps).  Main SoCs utilized: OMAP 4430 / 4460 / 4470.2 recommendations available upon request","endDate":null,"startDate":null},{"companyName":"Panasonic Silicon Valley Laboratory","role":"Software Engineering Intern ","description":"R&D software development, worked on multiple projects: - Master Thesis about innovative 3D user interfaces using OGRE rendering engine. - Automatic book-scanner project, image processing work using OpenCV (motion detection, same page detection, skin detection, hand removal from scans, etc.) - Android development, application layer and JNI. - Low level firmware development.4 recommendations available upon requestPage2","endDate":null,"startDate":null}],"firstName":"EM","lastName":"Mudhu","roleType":{"developer":true,"doesntMatter":false,"frontEndDeveloper":false,"fullStackDeveloper":false,"moneyForNothing":true,"okay":false},"employmentType":{"contract":true,"inter":false,"partTime":false,"permanent":false},"summary":"An enthusiast engineer looking for an exciting and challenging job as mobile software engineer. HELLO!"};

console.log(formGenerationUtils.generateForm(formDef));
console.log(formValidationUtils.validateForm(formDef, formValue));