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

module.exports = {
  formDefinition: formDef
}