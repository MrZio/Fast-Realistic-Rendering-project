/****************************************************************************
** Meta object code from reading C++ file 'glwidget.h'
**
** Created by: The Qt Meta Object Compiler version 69 (Qt 6.10.2)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include "../glwidget.h"
#include <QtCore/qmetatype.h>

#include <QtCore/qtmochelpers.h>

#include <memory>


#include <QtCore/qxptype_traits.h>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'glwidget.h' doesn't include <QObject>."
#elif Q_MOC_OUTPUT_REVISION != 69
#error "This file was generated using the moc from 6.10.2. It"
#error "cannot be used with the include files from this version of Qt."
#error "(The moc has changed too much.)"
#endif

#ifndef Q_CONSTINIT
#define Q_CONSTINIT
#endif

QT_WARNING_PUSH
QT_WARNING_DISABLE_DEPRECATED
QT_WARNING_DISABLE_GCC("-Wuseless-cast")
namespace {
struct qt_meta_tag_ZN8GLWidgetE_t {};
} // unnamed namespace

template <> constexpr inline auto GLWidget::qt_create_metaobjectdata<qt_meta_tag_ZN8GLWidgetE_t>()
{
    namespace QMC = QtMocConstants;
    QtMocHelpers::StringRefStorage qt_stringData {
        "GLWidget",
        "SetFaces",
        "",
        "SetVertices",
        "SetFramerate",
        "paintGL",
        "SetReflection",
        "set",
        "SetPBS",
        "SetIBLPBS",
        "SetPhong",
        "SetTexMap",
        "SetFresnelR",
        "SetFresnelB",
        "SetFresnelG",
        "SetCurrentTexture",
        "SetSkyVisible",
        "SetMetalness",
        "SetRoughness"
    };

    QtMocHelpers::UintData qt_methods {
        // Signal 'SetFaces'
        QtMocHelpers::SignalData<void(QString)>(1, 2, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 2 },
        }}),
        // Signal 'SetVertices'
        QtMocHelpers::SignalData<void(QString)>(3, 2, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 2 },
        }}),
        // Signal 'SetFramerate'
        QtMocHelpers::SignalData<void(QString)>(4, 2, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 2 },
        }}),
        // Slot 'paintGL'
        QtMocHelpers::SlotData<void()>(5, 2, QMC::AccessProtected, QMetaType::Void),
        // Slot 'SetReflection'
        QtMocHelpers::SlotData<void(bool)>(6, 2, QMC::AccessProtected, QMetaType::Void, {{
            { QMetaType::Bool, 7 },
        }}),
        // Slot 'SetPBS'
        QtMocHelpers::SlotData<void(bool)>(8, 2, QMC::AccessProtected, QMetaType::Void, {{
            { QMetaType::Bool, 7 },
        }}),
        // Slot 'SetIBLPBS'
        QtMocHelpers::SlotData<void(bool)>(9, 2, QMC::AccessProtected, QMetaType::Void, {{
            { QMetaType::Bool, 7 },
        }}),
        // Slot 'SetPhong'
        QtMocHelpers::SlotData<void(bool)>(10, 2, QMC::AccessProtected, QMetaType::Void, {{
            { QMetaType::Bool, 7 },
        }}),
        // Slot 'SetTexMap'
        QtMocHelpers::SlotData<void(bool)>(11, 2, QMC::AccessProtected, QMetaType::Void, {{
            { QMetaType::Bool, 7 },
        }}),
        // Slot 'SetFresnelR'
        QtMocHelpers::SlotData<void(double)>(12, 2, QMC::AccessProtected, QMetaType::Void, {{
            { QMetaType::Double, 2 },
        }}),
        // Slot 'SetFresnelB'
        QtMocHelpers::SlotData<void(double)>(13, 2, QMC::AccessProtected, QMetaType::Void, {{
            { QMetaType::Double, 2 },
        }}),
        // Slot 'SetFresnelG'
        QtMocHelpers::SlotData<void(double)>(14, 2, QMC::AccessProtected, QMetaType::Void, {{
            { QMetaType::Double, 2 },
        }}),
        // Slot 'SetCurrentTexture'
        QtMocHelpers::SlotData<void(int)>(15, 2, QMC::AccessProtected, QMetaType::Void, {{
            { QMetaType::Int, 2 },
        }}),
        // Slot 'SetSkyVisible'
        QtMocHelpers::SlotData<void(bool)>(16, 2, QMC::AccessProtected, QMetaType::Void, {{
            { QMetaType::Bool, 7 },
        }}),
        // Slot 'SetMetalness'
        QtMocHelpers::SlotData<void(double)>(17, 2, QMC::AccessProtected, QMetaType::Void, {{
            { QMetaType::Double, 2 },
        }}),
        // Slot 'SetRoughness'
        QtMocHelpers::SlotData<void(double)>(18, 2, QMC::AccessProtected, QMetaType::Void, {{
            { QMetaType::Double, 2 },
        }}),
    };
    QtMocHelpers::UintData qt_properties {
    };
    QtMocHelpers::UintData qt_enums {
    };
    return QtMocHelpers::metaObjectData<GLWidget, qt_meta_tag_ZN8GLWidgetE_t>(QMC::MetaObjectFlag{}, qt_stringData,
            qt_methods, qt_properties, qt_enums);
}
Q_CONSTINIT const QMetaObject GLWidget::staticMetaObject = { {
    QMetaObject::SuperData::link<QOpenGLWidget::staticMetaObject>(),
    qt_staticMetaObjectStaticContent<qt_meta_tag_ZN8GLWidgetE_t>.stringdata,
    qt_staticMetaObjectStaticContent<qt_meta_tag_ZN8GLWidgetE_t>.data,
    qt_static_metacall,
    nullptr,
    qt_staticMetaObjectRelocatingContent<qt_meta_tag_ZN8GLWidgetE_t>.metaTypes,
    nullptr
} };

void GLWidget::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    auto *_t = static_cast<GLWidget *>(_o);
    if (_c == QMetaObject::InvokeMetaMethod) {
        switch (_id) {
        case 0: _t->SetFaces((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1]))); break;
        case 1: _t->SetVertices((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1]))); break;
        case 2: _t->SetFramerate((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1]))); break;
        case 3: _t->paintGL(); break;
        case 4: _t->SetReflection((*reinterpret_cast<std::add_pointer_t<bool>>(_a[1]))); break;
        case 5: _t->SetPBS((*reinterpret_cast<std::add_pointer_t<bool>>(_a[1]))); break;
        case 6: _t->SetIBLPBS((*reinterpret_cast<std::add_pointer_t<bool>>(_a[1]))); break;
        case 7: _t->SetPhong((*reinterpret_cast<std::add_pointer_t<bool>>(_a[1]))); break;
        case 8: _t->SetTexMap((*reinterpret_cast<std::add_pointer_t<bool>>(_a[1]))); break;
        case 9: _t->SetFresnelR((*reinterpret_cast<std::add_pointer_t<double>>(_a[1]))); break;
        case 10: _t->SetFresnelB((*reinterpret_cast<std::add_pointer_t<double>>(_a[1]))); break;
        case 11: _t->SetFresnelG((*reinterpret_cast<std::add_pointer_t<double>>(_a[1]))); break;
        case 12: _t->SetCurrentTexture((*reinterpret_cast<std::add_pointer_t<int>>(_a[1]))); break;
        case 13: _t->SetSkyVisible((*reinterpret_cast<std::add_pointer_t<bool>>(_a[1]))); break;
        case 14: _t->SetMetalness((*reinterpret_cast<std::add_pointer_t<double>>(_a[1]))); break;
        case 15: _t->SetRoughness((*reinterpret_cast<std::add_pointer_t<double>>(_a[1]))); break;
        default: ;
        }
    }
    if (_c == QMetaObject::IndexOfMethod) {
        if (QtMocHelpers::indexOfMethod<void (GLWidget::*)(QString )>(_a, &GLWidget::SetFaces, 0))
            return;
        if (QtMocHelpers::indexOfMethod<void (GLWidget::*)(QString )>(_a, &GLWidget::SetVertices, 1))
            return;
        if (QtMocHelpers::indexOfMethod<void (GLWidget::*)(QString )>(_a, &GLWidget::SetFramerate, 2))
            return;
    }
}

const QMetaObject *GLWidget::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *GLWidget::qt_metacast(const char *_clname)
{
    if (!_clname) return nullptr;
    if (!strcmp(_clname, qt_staticMetaObjectStaticContent<qt_meta_tag_ZN8GLWidgetE_t>.strings))
        return static_cast<void*>(this);
    if (!strcmp(_clname, "QOpenGLFunctions_3_3_Core"))
        return static_cast< QOpenGLFunctions_3_3_Core*>(this);
    return QOpenGLWidget::qt_metacast(_clname);
}

int GLWidget::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
{
    _id = QOpenGLWidget::qt_metacall(_c, _id, _a);
    if (_id < 0)
        return _id;
    if (_c == QMetaObject::InvokeMetaMethod) {
        if (_id < 16)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 16;
    }
    if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        if (_id < 16)
            *reinterpret_cast<QMetaType *>(_a[0]) = QMetaType();
        _id -= 16;
    }
    return _id;
}

// SIGNAL 0
void GLWidget::SetFaces(QString _t1)
{
    QMetaObject::activate<void>(this, &staticMetaObject, 0, nullptr, _t1);
}

// SIGNAL 1
void GLWidget::SetVertices(QString _t1)
{
    QMetaObject::activate<void>(this, &staticMetaObject, 1, nullptr, _t1);
}

// SIGNAL 2
void GLWidget::SetFramerate(QString _t1)
{
    QMetaObject::activate<void>(this, &staticMetaObject, 2, nullptr, _t1);
}
QT_WARNING_POP
