import json
from ruwordnet import RuWordNet

# Инициализация RuWordNet
wn = RuWordNet(filename_or_session="ruwordnet-2021.db")

# Функция для определения синтагматических отношений
def get_syntagmatic_relationship(word, reaction):
    # Проверка на словосочетание (гиперонимы/гипонимы)
    for sense_word in wn.get_senses(word):
        for sense_reaction in wn.get_senses(reaction):
            if sense_reaction.synset in sense_word.synset.hypernyms or sense_reaction.synset in sense_word.synset.hyponyms:
                return "Словосочетание"

    # Проверка на аббревиатуру
    if word.upper() == reaction or reaction.upper() == word:
        return "Аббревиатура"

    # Проверка на сложносоставное слово
    if word in reaction or reaction in word:
        return "Сложносоставное слово"

    # Если ничего не подходит, считаем это разрывной синтаксической конструкцией
    return "Разрывная синтаксическая конструкция"

# Функция для определения парадигматических отношений
def get_paradigmatic_relationship(word, reaction):
    relationships = []

    for sense_word in wn.get_senses(word):
        for sense_reaction in wn.get_senses(reaction):
            # Часть-целое
            if sense_reaction.synset in sense_word.synset.meronyms or sense_reaction.synset in sense_word.synset.holonyms:
                relationships.append("Часть-целое")

            # Род-вид
            if sense_reaction.synset in sense_word.synset.hypernyms or sense_reaction.synset in sense_word.synset.hyponyms:
                relationships.append("Род-вид")

            # Синонимия
            if sense_word.synset == sense_reaction.synset:
                relationships.append("Синоним")

            # Антонимия
            if sense_reaction.synset in sense_word.synset.antonyms:
                relationships.append("Антоним")

            # Класс-экземпляр
            if sense_reaction.synset in sense_word.synset.instances or sense_word.synset in sense_reaction.synset.classes:
                relationships.append("Класс-экземпляр")

            # Однокоренные слова
            if any(d.name == reaction for d in sense_word.derivations):
                relationships.append("Однокоренные слова")

    return ", ".join(relationships) if relationships else "Нет явных парадигматических отношений"

# Основной код
if __name__ == "__main__":
    # Загрузка данных из JSON-файла
    with open("./data/data.json", "r", encoding="utf-8") as file:
        data = json.load(file)

    # Анализ данных
    analyzed_data = []
    for entry in data:
        word = entry["word"]
        reaction = entry["reaction"]

        # Преобразование слов в нужный регистр
        word = word.capitalize()
        reaction = reaction.capitalize()

        # Определение типов отношений
        syntagmatic_relationship = get_syntagmatic_relationship(word, reaction)
        paradigmatic_relationship = get_paradigmatic_relationship(word, reaction)

        # Сохранение результатов
        analyzed_data.append({
            "word": word,
            "reaction": reaction,
            "timestamp": entry.get("timestamp", ""),
            "syntagmatic_relationship": syntagmatic_relationship,
            "paradigmatic_relationship": paradigmatic_relationship
        })

    # Вывод первых 10 записей
    for item in analyzed_data[:10]:
        print(item)

    # Сохранение результатов в файл
    with open("analyzed_data.json", "w", encoding="utf-8") as file:
        json.dump(analyzed_data, file, ensure_ascii=False, indent=4)