var candidateRejectionFormConfig = {
  "meta": {
    "kind": "struct",
    "props": {
      "mediocreSalaryOffer": {"meta": {"kind": "irreducible", "name": "Bool"}},
      "badReputation": {"meta": {"kind": "irreducible", "name": "Bool"}},
      "notGoodFit": {"meta": {"kind": "irreducible", "name": "Bool"}},
      "somethingElse": {"meta": {"kind": "irreducible", "name": "Bool"}}
    }
  }
};

var companyRejectionFormConfig = {
  "meta": {
    "kind": "struct",
    "props": {
      "highSalaryExpectation": {"meta": {"kind": "irreducible", "name": "Bool"}},
      "lackOfWorkExpirience": {"meta": {"kind": "irreducible", "name": "Bool"}},
      "inadequateSkills": {"meta": {"kind": "irreducible", "name": "Bool"}},
      "grammarAndSpellingErrors": {"meta": {"kind": "irreducible", "name": "Bool"}},
      "notGoodFit": {"meta": {"kind": "irreducible", "name": "Bool"}},
      "somethingElse": {"meta": {"kind": "irreducible", "name": "Bool"}}
    }
  }
};

module.exports = {
  candidateRejectionFormConfig: candidateRejectionFormConfig,
  companyRejectionFormConfig: companyRejectionFormConfig
};